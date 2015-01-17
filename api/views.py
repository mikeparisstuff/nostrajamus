from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import detail_route, list_route
from api.models import Profile, Contest, SCTrack, SCPeriodicPlayCount, SCUser, ContestEntry
from api.serializers import ProfileSerializer, ContestSerializer, SCTrackSerializer, SCPeriodicPlayCountSerializer, SCUserSerializer, ContestEntrySerializer

import soundcloud
client = soundcloud.Client(client_id='011325f9ff53871e49215492068499c6')

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (permissions.AllowAny,)

    # def create(self, request):
    #     data = request.data
    #     user_serializer = ProfileSerializer(data=data, context={'request': request})
    #     if user_serializer.is_valid():
    #         new_user = user_serializer.save()
    #         return Response(user_serializer.data, status=status.HTTP_201_CREATED)
    #     else:
    #         return Response({"error": user_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    # def list(self, request):
    #     pass
    #
    # def retrieve(self, request, pk=None):
    #     pass
    #
    # def update(self, request, pk=None):
    #     pass
    #
    # def partial_update(self, request, pk=None):
    #     pass
    #
    # def destroy(self, request, pk=None):
    #     pass

    # Can also use @detail_route and @list_route decorators to add routes
class ContestEntryViewSet(viewsets.ModelViewSet):
    queryset = ContestEntry.objects.all()
    serializer_class = ContestEntrySerializer

class ContestViewSet(viewsets.ModelViewSet):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer
    permission_classes = (permissions.AllowAny,)

    @detail_route()
    def entries(self, request, pk=None):
        contest = self.get_object()
        serializer = ContestEntrySerializer(contest.entries, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @detail_route(methods=("POST",))
    def enter(self, request, pk=None):
        contest = self.get_object()
        track_data = request.data.get("track")
        track_id = track_data['id']
        user_data = request.data.get("user")
        sc_user = client.get('/users/{}'.format(track_data['user']['id']))
        track_serializer = SCTrackSerializer(data=track_data)
        user_serializer = ProfileSerializer(data=user_data)
        print dir(track_serializer)
        if track_serializer.is_valid() and user_serializer.is_valid():
            print track_serializer.errors
            try:
                track = track_serializer.save()
            except:
                # The track already exists
                track = SCTrack.objects.get(sc_id = track_id)
            user = user_serializer.save()
            # Add a new Contest entry with the
            contest_entry = ContestEntry.objects.create(
                user=user,
                contest=contest,
                track=track,
                initial_playback_count=track_data["playback_count"],
                initial_follower_count=sc_user.followers_count
            )
            contest.contestentry_set.add(contest_entry)
            user.contests.add(contest)
            return Response({"detail": "success"}, status=status.HTTP_201_CREATED)
        else:
            return Response({'detail': 'Invalid data to enter in contest'}, status=status.HTTP_400_BAD_REQUEST)

class TrackViewSet(viewsets.ModelViewSet):
    queryset = SCTrack.objects.all()
    serializer_class = SCTrackSerializer

    @detail_route()
    def playcounts(self, request, pk=None):
        track = self.get_object()
        play_counts = SCPeriodicPlayCount.objects.filter(track=track)
        serializer = SCPeriodicPlayCountSerializer(play_counts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PeriodicPlayCountViewSet(viewsets.ModelViewSet):
    queryset = SCPeriodicPlayCount.objects.all()
    serializer_class = SCPeriodicPlayCountSerializer

class SCUserViewSet(viewsets.ModelViewSet):
    queryset = SCUser.objects.all()
    serializer_class = SCUserSerializer