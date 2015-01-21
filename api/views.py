from django.shortcuts import render, render_to_response, RequestContext, redirect
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import detail_route, list_route
from api.models import Profile, Contest, SCTrack, SCPeriodicPlayCount, SCUser, ContestEntry, Feedback
from api.serializers import ProfileSerializer, ContestSerializer, SCTrackSerializer, SCPeriodicPlayCountSerializer, SCUserSerializer, ContestEntrySerializer, FeedbackSerializer
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
import mailchimp
import os


MAILCHIMP_API_KEY = '9defc1dba727a90da8da8d294d3fa760-us10'
def get_mailchimp_api():
    return mailchimp.Mailchimp(MAILCHIMP_API_KEY)

instance_id = os.environ.get('INSTANCE_ID', None)
if instance_id == 'PROD':
    MAILCHIMP_LIST_ID = 'e0a05381ce'
else:
    MAILCHIMP_LIST_ID = '3556cd8dcc'

import soundcloud
client = soundcloud.Client(client_id='011325f9ff53871e49215492068499c6')


class HomePageView(APIView):
    def get(self, request, format=None):
        # if request.user.is_authenticated():
        #     print request.user
        #     print 'Render main page'
        #     return Response("Main Page")
        # else:
        data = {}
        if request.user.is_authenticated():
            user = request.user
            contest1 = user.contests.get(pk=1)
            contest_entry = ContestEntry.objects.get(user = user, contest=contest1)
            data['my_track'] = contest_entry.track
        return render_to_response("index2.html", RequestContext(request, data))

class LoginView(APIView):
    def get(self, request, format=None):
        return render_to_response('login.html')

    def post(self, request, format=None):
        data = request.data
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if user is not None:
            if user.is_active:
                login(request, user)
                print("User is valid, active and authenticated")
                return redirect('/')
            else:
                print("The password is valid, but the account has been disabled!")
                return redirect('/')
        else:
            # the authentication system was unable to verify the username and password
            print("The username and password were incorrect.")
            return redirect('/login/')


class LogoutView(APIView):
    def get(self, request, format=None):
        logout(request)
        return redirect('/')

class Contest1View(APIView):

    def get(self, request, format=None):
        if not request.user.is_authenticated():
            return redirect('/login/')
        user = request.user
        contest1 = user.contests.get(pk=1)
        contest_entry = ContestEntry.objects.get(user = user, contest=contest1)

        return render_to_response('contests.html', {'my_track': contest_entry})


class UserViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request):
        data = request.data
        user = Profile.objects.create_user(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            password=data['password'],
            username=data['username']
        )
        user_serializer = ProfileSerializer(user, context={'request': request})
        return Response(user_serializer.data, status=status.HTTP_201_CREATED)

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
        print request.data
        track_data = request.data.get("track")
        track_id = track_data['id']
        user_data = request.data.get("user")
        sc_user = client.get('/users/{}'.format(track_data['user']['id']))
        track_serializer = SCTrackSerializer(data=track_data)
        print dir(track_serializer)
        if track_serializer.is_valid():
            print track_serializer.errors
            try:
                track = SCTrack.objects.get(sc_id = track_id)
            except SCTrack.DoesNotExist:
                # The track already exists
                track = track_serializer.save()
            user = Profile.objects.create_user(
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                email=user_data['email'],
                password=user_data['password'],
                username=user_data['username']
            )

            # Add them to the mailing list
            try:
                m = get_mailchimp_api()
                m.lists.subscribe(MAILCHIMP_LIST_ID, {'email': user_data['email'], 'double_optin': False, 'send_welcome': True})
            except mailchimp.ListAlreadySubscribedError:
                pass
            except mailchimp.Error, e:
                pass

            user = authenticate(username=user_data['username'], password=user_data['password'])
            login(request, user)

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
            print track_serializer.errors
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

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer

    def create(self, request):
        data = request.data
        feedback = Feedback.objects.create(
            name = data['name'],
            text = data['text'],
            email = data['email']
        )
        return redirect('/')