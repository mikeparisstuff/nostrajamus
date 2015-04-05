from django.shortcuts import render, render_to_response, RequestContext, redirect
from rest_framework import viewsets, status, permissions, views
from rest_framework.response import Response
from rest_framework.decorators import detail_route, list_route
from api.models import Profile, Contest, SCTrack, SCPeriodicPlayCount, SCUser, ContestEntry, Feedback, ResetPasswordToken, PeriodicRanking, LikedTrack
from api.serializers import ProfileSerializer, ContestSerializer, SCTrackSerializer, SCPeriodicPlayCountSerializer, SCUserSerializer, ContestEntrySerializer, FeedbackSerializer, PaginatedContestEntrySerializer, PaginatedRankingSerializer, RankingSerializer, LikedTrackSerializer
from django.contrib.auth import authenticate, login, logout
from django.db.models import Sum
from django.core.mail import send_mail
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from rest_framework.views import APIView
from api.search_indexes import SCTrackIndex
import mailchimp
from . import authentication
import os, string, random
from haystack.query import SearchQuerySet
from haystack.inputs import AutoQuery, Clean
from referral.models import UserReferrer

from .search_indexes import SCTrackIndex, ProfileIndex
from datetime import datetime, date, timedelta
from .tasks import start_contest, end_contest


MAILCHIMP_API_KEY = '9defc1dba727a90da8da8d294d3fa760-us10'
def get_mailchimp_api():
    return mailchimp.Mailchimp(MAILCHIMP_API_KEY)

instance_id = os.environ.get('INSTANCE_ID', None)
if instance_id == 'PROD':
    MAILCHIMP_LIST_ID = 'e0a05381ce'
else:
    MAILCHIMP_LIST_ID = '3556cd8dcc'

import soundcloud
client = soundcloud.Client(client_id='f0b7083f9e4c053ca072c48a26e8567a')
# 011325f9ff53871e49215492068499c6


from django.views.generic.base import TemplateView


class OnePageAppView(TemplateView):
    template_name = 'index.html'

# class HomePageView(APIView):
#     def get(self, request, format=None):
#         if request.user.is_authenticated():
#             return render_to_response("index.html", RequestContext(request))
#         else:
#             return render_to_response("landing.html")

class SCCallbackView(APIView):
    def get(self, request, format=None):
        return render_to_response("callback.html")

class ForgetView(APIView):
    def get(self, request, format=None):
        return render_to_response("forgot.html")

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
                return Response({"detail": "Successfully logged user in"}, status=status.HTTP_200_OK)
            else:
                print("The password is valid, but the account has been disabled!")
                return Response({"detail": "The password is valid, but the account has been disabled!"}, status=status.HTTP_403_FORBIDDEN)
        else:
            # the authentication system was unable to verify the username and password
            print("The username and password were incorrect.")
            return Response({"detail": "The username and password were incorrect."}, status=status.HTTP_403_FORBIDDEN)

class AuthView(APIView):
    authentication_classes = (authentication.QuietBasicAuthentication,)

    def post(self, request, *args, **kwargs):
        login(request, request.user)
        return Response(ProfileSerializer(request.user, context={'request': request}).data)

    def delete(self, request, *args, **kwargs):
        logout(request)
        return Response({})

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

def id_generator(size=8, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

class UserViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        try:
            fname = request.data['first_name']
            lname = request.data['last_name']
            email = request.data['email']
            password = request.data['password']
            username = request.data['username']
            profile_picture = request.data.get('profile_picture', None)
            location = request.data.get('location', None)
            user = Profile.objects.create_user(
                first_name=fname,
                last_name=lname,
                email=email,
                password=password,
                username=username
            )
            # If this user was referred apply it here
            UserReferrer.objects.apply_referrer(user, request)

            if profile_picture:
                user.profile_picture = profile_picture
                user.save()
            if location:
                user.location = location
                user.save()
            authenticated = authenticate(username=username, password=password)
            login(request, authenticated)
            user_serializer = ProfileSerializer(user, context={'request': request})
            return Response(user_serializer.data, status=status.HTTP_200_OK)
        except KeyError as e:
            return Response({
                "detail": "Missing some fields with error: {}".format(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            fname = request.data['first_name']
            lname = request.data['last_name']
            email = request.data['email']
            profile_picture = request.FILES.get('file', None)
            location = request.data.get('location', None)
            user = request.user
            user.first_name = fname
            user.last_name = lname
            user.email = email
            if profile_picture:
                user.profile_picture = profile_picture
            if location:
                user.location = location
                user.save()
            user.save()
            user_serializer = ProfileSerializer(user, context={'request': request})
            return Response(user_serializer.data, status=status.HTTP_200_OK)
        except KeyError as e:
            return Response({
                "detail": "Missing some fields with error: {}".format(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception, e:
            a = e
            print e


    @list_route(methods=("POST",))
    def initiate_password_reset(self, request, *args, **kwargs):
        try:
            email = request.data['email']
            token = id_generator()
            reset_token = ResetPasswordToken.objects.create(email=email, token=token)
            send_mail('Nostrajamus Password Reset',
                      "Please use this token to reset your password: {}".format(token),
                      "nostrajamus.music@gmail.com",
                      ["{}".format(email)],
                      fail_silently=False
            )
            return Response({"detail": "Sent password reset token"}, status=status.HTTP_200_OK)
        except KeyError as e:
            return Response({"detail": "Please send an email"}, status=status.HTTP_400_BAD_REQUEST)

    @list_route(methods=("POST",))
    def reset_password(self, request):
        try:
            token = request.data['token']
            new_password = request.data['new_password']
            reset_token = ResetPasswordToken.objects.get(token=token, is_active=True)
            user = Profile.objects.get(email=reset_token.email)
            user.set_password(new_password)
            user.save()
            reset_token.is_active = False
            reset_token.save()
            return Response({"detail": "Successfully reset password"}, status=status.HTTP_200_OK)
        except KeyError as e:
            return Response({"detail": "Please send a token and new_password"}, status=status.HTTP_400_BAD_REQUEST)
        except ResetPasswordToken.DoesNotExist:
            return Response({"detail": "We could not find a matching, active reset token"}, status=status.HTTP_400_BAD_REQUEST)

    @list_route(permission_classes=(permissions.IsAuthenticated,))
    def me(self, request):
        user = request.user
        serializer = ProfileSerializer(user, context={'request': request})
        return Response(serializer.data, status.HTTP_200_OK)


    @list_route(permission_classes=(permissions.AllowAny,))
    def leaderboard(self, request):
        leaders = Profile.objects.all().order_by('-jam_points')[:25]
        serializer = ProfileSerializer(leaders, many=True, context={'request': request})
        return Response(serializer.data, status.HTTP_200_OK)

    @detail_route(permission_classes=(permissions.IsAuthenticated,))
    def likes(self, request, pk=None):
        user = self.get_object()
        likes = user.likes
        serializer = LikedTrackSerializer(likes, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

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

    def create(self, request, *args, **kwargs):
        data = request.data
        serializer = ContestSerializer(data=data)
        # start = serializer.data['start_time']
        # end = serializer.data['end_time']
        # # start_contest.apply_async(eta=datetime(2015, 1, 23, 16, 0, 0,tzinfo=timezone('US/Eastern')))
        # start_contest.apply_async(eta=start)
        # end_contest.apply_async(eta=end)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        contests = Contest.objects.all()
        serialzer = ContestSerializer(contests, many=True, context={'request': request})
        return Response(serialzer.data, status=status.HTTP_200_OK)

    @detail_route()
    def entries(self, request, pk=None):
        contest = self.get_object()
        queryset = contest.entries
        paginator = Paginator(queryset, 10)
        page = request.QUERY_PARAMS.get('page')
        try:
            entries = paginator.page(page)
        except PageNotAnInteger:
            entries = paginator.page(1)
        except EmptyPage:
            entries = paginator.page(paginator.num_pages)

        serializer = PaginatedContestEntrySerializer(entries, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @detail_route()
    def rank(self, request, pk=None):
        try:
            contest = self.get_object()
            entries = contest.entries
            user = request.user
            rank = -1
            for i, entry in enumerate(entries):
                if entry.user == user:
                    rank = i + 1
                    break
            return Response({"rank": rank}, status=status.HTTP_200_OK)
        except Exception, e:
            return Response({"detail": "Either you were not logged in or this is an invalid contest"}, status=status.HTTP_400_BAD_REQUEST)


    @detail_route(methods=("POST",), permission_classes=(permissions.IsAuthenticated,))
    def enter(self, request, pk=None):
        try:
            contest = self.get_object()
            track_data = request.data['track']
            sc_user = client.get('/users/{}'.format(track_data['user']['id']))
            track_id = track_data['id']
            track_serializer = SCTrackSerializer(data=track_data)
            if track_serializer.is_valid():
                try:
                    track = SCTrack.objects.get(sc_id=track_id)
                except SCTrack.DoesNotExist:
                    track = track_serializer.save()
                user = request.user
                contest_entry = ContestEntry.objects.create(
                    user = user,
                    contest = contest,
                    track = track,
                    initial_playback_count = track_data["playback_count"],
                    initial_follower_count = sc_user.followers_count,
                    current_playback_count = track_data["playback_count"],
                    current_follower_count = sc_user.followers_count
                )
                # entry_serializer = ContestEntrySerializer(contest_entry, context={'request': request})
                # return Response(entry_serializer.data, status=status.HTTP_200_OK)
                return Response({"detail": "Successfully submitted track"}, status=status.HTTP_200_OK)
        except KeyError as e:
            return Response({
                "detail": "You need to submit a track."
            }, status=status.HTTP_400_BAD_REQUEST)
        except Contest.DoesNotExist as e:
            return Response({
                "detail": "Could not find Contest with id={}".format(pk)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception, e:
            print e
            return Response({
                "detail": e
            }, status=status.HTTP_400_BAD_REQUEST)

    # @detail_route(methods=("POST",))
    # def enter(self, request, pk=None):
    #     contest = self.get_object()
    #     print request.data
    #     track_data = request.data.get("track")
    #     track_id = track_data['id']
    #     user_data = request.data.get("user")
    #     sc_user = client.get('/users/{}'.format(track_data['user']['id']))
    #     track_serializer = SCTrackSerializer(data=track_data)
    #     print dir(track_serializer)
    #     if track_serializer.is_valid():
    #         print track_serializer.errors
    #         try:
    #             track = SCTrack.objects.get(sc_id = track_id)
    #         except SCTrack.DoesNotExist:
    #             # The track already exists
    #             track = track_serializer.save()
    #         user = Profile.objects.create_user(
    #             first_name=user_data['first_name'],
    #             last_name=user_data['last_name'],
    #             email=user_data['email'],
    #             password=user_data['password'],
    #             username=user_data['username']
    #         )
    #
    #         # Add them to the mailing list
    #         try:
    #             m = get_mailchimp_api()
    #             m.lists.subscribe(MAILCHIMP_LIST_ID, {'email': user_data['email'], 'double_optin': False, 'send_welcome': True})
    #         except mailchimp.ListAlreadySubscribedError:
    #             pass
    #         except mailchimp.Error, e:
    #             pass
    #
    #         user = authenticate(username=user_data['username'], password=user_data['password'])
    #         login(request, user)
    #
    #         # Add a new Contest entry with the
    #         contest_entry = ContestEntry.objects.create(
    #             user=user,
    #             contest=contest,
    #             track=track,
    #             initial_playback_count=track_data["playback_count"],
    #             initial_follower_count=sc_user.followers_count
    #         )
    #         contest.contestentry_set.add(contest_entry)
    #         # user.contests.add(contest)
    #         return Response({"detail": "success"}, status=status.HTTP_201_CREATED)
    #     else:
    #         print track_serializer.errors
    #         return Response({'detail': 'Invalid data to enter in contest'}, status=status.HTTP_400_BAD_REQUEST)

class TrackViewSet(viewsets.ModelViewSet):
    queryset = SCTrack.objects.all()
    serializer_class = SCTrackSerializer

    @detail_route()
    def playcounts(self, request, pk=None):
        track = self.get_object()
        play_counts = SCPeriodicPlayCount.objects.filter(track=track)
        serializer = SCPeriodicPlayCountSerializer(play_counts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @detail_route(methods=("POST",), permission_classes=(permissions.IsAuthenticated,))
    def played(self, request, pk=None):
        track = self.get_object()
        track.increment_playback_count()
        return Response({'detail': 'Successfully incremented playcount for track {}'.format(pk)}, status=status.HTTP_200_OK)

    @detail_route(methods=("GET",))
    def stats(self, request, pk=None):
        track = self.get_object()
        all_time_stats = PeriodicRanking.objects.get(track = track, type='ALLTIME')
        serializer = RankingSerializer(all_time_stats, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @detail_route(methods=("POST",), permission_classes=(permissions.IsAuthenticated,))
    def like(self, request, pk=None):
        track = self.get_object()
        ranking = PeriodicRanking.objects.get(track = track, type='ALLTIME')
        obj, created = LikedTrack.objects.get_or_create(
            user = request.user,
            track = ranking
        )
        if not created:
            # The like already existed so we should delete it
            obj.delete()
            return Response({'detail': 'Successfully removed liked track with id: {}'.format(pk)}, status=status.HTTP_200_OK)
        return Response({'detail': 'Successfully liked track with id: {}'.format(pk)}, status=status.HTTP_200_OK)

    @list_route()
    def total_streams(self, request):
        total_streams = SCTrack.objects.aggregate(total_streams=Sum('jamus_playback_count'))
        return Response(total_streams, status=status.HTTP_200_OK)

    @list_route()
    def trending(self, request):
        filter = request.QUERY_PARAMS.get('filter')
        if filter == 'daily':
            queryset = PeriodicRanking.objects.filter(type='DAILY')
        elif filter == 'weekly':
            queryset = PeriodicRanking.objects.filter(type='WEEKLY')
        elif filter == 'monthly':
            queryset = PeriodicRanking.objects.filter(type='MONTHLY')
        elif filter == 'alltime':
            queryset = PeriodicRanking.objects.filter(type='ALLTIME')
        else:
            queryset = PeriodicRanking.objects.filter(type='WEEKLY')

        paginator = Paginator(queryset, 10)
        page = request.QUERY_PARAMS.get('page')
        try:
            entries = paginator.page(page)
        except PageNotAnInteger:
            entries = paginator.page(1)
        except EmptyPage:
            entries = paginator.page(paginator.num_pages)

        serializer = PaginatedRankingSerializer(entries, context={'request': request})
        # entries = ContestEntry.objects.filter(created_at__range=[start, today]).order_by('-jam_points')[:25]
        # entries = ContestEntry.objects.all().order_by('-jam_points')
        # serializer = ContestEntrySerializer(entries, many=True)
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
        return Response({"detail": "Success"}, status=status.HTTP_200_OK)

class TrackSearchView(views.APIView):
    """My custom search view."""

    def get(self, request):
        # query_set = SearchQuerySet(using=SCTrackIndex().index_queryset())
        query = request.GET['q']
        results = SearchQuerySet().filter(content__contains=AutoQuery(query))
        items = [q.object for q in results]
        print items
        res = []
        for item in items:
            if isinstance(item, SCTrack):
                res.append({'type': 'track', 'title': item.title, 'artist': item.user.username, 'id': item.id, 'sc_id': item.sc_id, 'artwork_url': item.artwork_url})
            elif isinstance(item, Profile):
                try:
                    prof_pic_url = item.profile_picture.url
                except ValueError as e:
                    prof_pic_url = None
                res.append({'type': "profile", 'username': item.username, 'profile_picture': prof_pic_url, 'name': item.get_full_name(), 'id': item.id})
        # res['tracks'] = SCTrackSerializer(res['tracks'], many=True).data
        # res['users'] = ProfileSerializer(res['users'], many=True).data
        return Response(res, status=status.HTTP_200_OK)