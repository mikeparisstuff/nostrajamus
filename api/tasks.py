from __future__ import absolute_import

from api.models import SCTrack, SCUser, SCPeriodicPlayCount, ContestEntry, Profile, Contest, PeriodicRanking
from django.db.models import Sum
from requests.exceptions import HTTPError
from celery import shared_task
import soundcloud
from datetime import timedelta, datetime
from django.utils import timezone

client = soundcloud.Client(client_id='011325f9ff53871e49215492068499c6')

def calculate_jam_points(initial_playcount, initial_followers, final_playcount, final_followers):
    initial_playcount = float(initial_playcount)
    initial_followers = float(initial_followers)
    final_playcount = float(final_playcount)
    final_followers = float(final_followers)
    if initial_followers == 0:
        initial_followers = 1
    follow_unit = final_followers * ((final_followers - initial_followers)/initial_followers)
    playcount_unit = (final_playcount ** (7.0/8.0)) * (((final_playcount - initial_playcount)/initial_playcount) ** ( 8.0/7.0))
    denom = (initial_playcount ** (0.5)) + (initial_followers ** (0.5))
    jam_points = (follow_unit + playcount_unit)/denom
    if jam_points < 0:
        print "Found Negative Jam Points"
        print "{}, {}, {}, {}: {}".format(initial_playcount, initial_followers, final_playcount, final_followers, jam_points)
        return 0
    return (jam_points**0.5)


@shared_task
def update_playcount():
    tracks = SCTrack.objects.all()
    for track in tracks:
        try:
            new_track = client.get('/tracks/{}'.format(track.sc_id))
            new_user = client.get('/users/{}'.format(track.user.sc_id))
            all_entries = ContestEntry.objects.filter(track=track, is_active=True)
            SCPeriodicPlayCount.objects.create(
                playback_count=new_track.playback_count,
                follower_count=new_user.followers_count,
                track=track
            )
            for entry in all_entries:
                new_jam_points = calculate_jam_points(entry.initial_playback_count,
                                                      entry.initial_follower_count,
                                                      new_track.playback_count,
                                                      new_user.followers_count)
                entry.jam_points = new_jam_points
                entry.current_playback_count = new_track.playback_count
                entry.current_follower_count = new_user.followers_count
                entry.save()
        except HTTPError as e:
            print 'Error getting track with id: {}'.format(track.sc_id)
            print 'ERROR: {}'.format(e)
        except AttributeError as e:
            print 'Attribute Error on track: {}'.format(track.sc_id)
            print 'ERROR: {}'.format(e)

@shared_task
def update_daily_rankings():
    tracks = SCTrack.objects.all()
    for track in tracks:
        # Update Weekly
        last_day = timezone.now() - timedelta(days=1)
        try:
            most_recent = SCPeriodicPlayCount.objects.filter(track=track).order_by('-created_at')[0]
        except IndexError as e:
            print "Could not get periodic playcount for track: {}".format(track.title)
            continue
        daily = SCPeriodicPlayCount.objects.filter(created_at__lte=last_day, track=track).order_by('-created_at')[:1]
        if len(daily) > 0:
            daily = daily[0]
        else:
            daily = SCPeriodicPlayCount.objects.filter(track=track).earliest('created_at')
        jam_points = calculate_jam_points(daily.playback_count, daily.follower_count, most_recent.playback_count, most_recent.follower_count )
        try:
            week_entry = PeriodicRanking.objects.get(track = track, type='DAILY')
            week_entry.jam_points = jam_points
            week_entry.initial_playback_count = daily.playback_count
            week_entry.initial_follower_count = daily.follower_count
            week_entry.current_playback_count = most_recent.playback_count
            week_entry.current_follower_count = most_recent.follower_count
            week_entry.save()
        except PeriodicRanking.DoesNotExist:
            PeriodicRanking.objects.create(
                track = track,
                type = 'DAILY',
                jam_points = jam_points,
                initial_playback_count = daily.playback_count,
                initial_follower_count = daily.follower_count,
                current_playback_count = most_recent.playback_count,
                current_follower_count = most_recent.follower_count
            )

@shared_task
def update_weekly_rankings():
    tracks = SCTrack.objects.all()
    for track in tracks:
        # Update Weekly
        last_week = timezone.now() - timedelta(days=7)
        try:
            most_recent = SCPeriodicPlayCount.objects.filter(track=track).order_by('-created_at')[0]
        except IndexError as e:
            print "Could not get periodic playcount for track: {}".format(track.title)
            continue
        weekly = SCPeriodicPlayCount.objects.filter(created_at__lte=last_week, track=track).order_by('-created_at')[:1]
        if len(weekly) > 0:
            weekly = weekly[0]
        else:
            weekly = SCPeriodicPlayCount.objects.filter(track=track).earliest('created_at')
        jam_points = calculate_jam_points(weekly.playback_count, weekly.follower_count, most_recent.playback_count, most_recent.follower_count )
        try:
            week_entry = PeriodicRanking.objects.get(track = track, type='WEEKLY')
            week_entry.jam_points = jam_points
            week_entry.initial_playback_count = weekly.playback_count
            week_entry.initial_follower_count = weekly.follower_count
            week_entry.current_playback_count = most_recent.playback_count
            week_entry.current_follower_count = most_recent.follower_count
            week_entry.save()
        except PeriodicRanking.DoesNotExist:
            PeriodicRanking.objects.create(
                track = track,
                type = 'WEEKLY',
                jam_points = jam_points,
                initial_playback_count = weekly.playback_count,
                initial_follower_count = weekly.follower_count,
                current_playback_count = most_recent.playback_count,
                current_follower_count = most_recent.follower_count
            )

@shared_task
def update_monthly_rankings():
    tracks = SCTrack.objects.all()
    for track in tracks:
        # Update Weekly
        last_month = timezone.now() - timedelta(days=30)
        try:
            most_recent = SCPeriodicPlayCount.objects.filter(track=track).order_by('-created_at')[0]
        except IndexError as e:
            print "Could not get periodic playcount for track: {}".format(track.title)
            continue
        monthly = SCPeriodicPlayCount.objects.filter(created_at__lte=last_month, track=track).order_by('-created_at')[:1]
        if len(monthly) > 0:
            monthly = monthly[0]
        else:
            monthly = SCPeriodicPlayCount.objects.filter(track=track).earliest('created_at')
        jam_points = calculate_jam_points(monthly.playback_count, monthly.follower_count, most_recent.playback_count, most_recent.follower_count )
        try:
            month_entry = PeriodicRanking.objects.get(track = track, type='MONTHLY')
            month_entry.jam_points = jam_points
            month_entry.initial_playback_count = monthly.playback_count
            month_entry.initial_follower_count = monthly.follower_count
            month_entry.current_playback_count = most_recent.playback_count
            month_entry.current_follower_count = most_recent.follower_count
            month_entry.save()
        except PeriodicRanking.DoesNotExist:
            PeriodicRanking.objects.create(
                track = track,
                type = 'MONTHLY',
                jam_points = jam_points,
                initial_playback_count = monthly.playback_count,
                initial_follower_count = monthly.follower_count,
                current_playback_count = most_recent.playback_count,
                current_follower_count = most_recent.follower_count
            )

@shared_task
def update_all_time_rankings():
    tracks = SCTrack.objects.all()
    for track in tracks:
        # Update Weekly
        try:
            most_recent = SCPeriodicPlayCount.objects.filter(track=track).order_by('-created_at')[0]
        except IndexError as e:
            print "Could not get periodic playcount for track: {}".format(track.title)
            continue
        all_time = SCPeriodicPlayCount.objects.filter(track=track).earliest('created_at')
        jam_points = calculate_jam_points(all_time.playback_count, all_time.follower_count, most_recent.playback_count, most_recent.follower_count )
        try:
            week_entry = PeriodicRanking.objects.get(track = track, type='ALLTIME')
            week_entry.jam_points = jam_points
            week_entry.initial_playback_count = all_time.playback_count
            week_entry.initial_follower_count = all_time.follower_count
            week_entry.current_playback_count = most_recent.playback_count
            week_entry.current_follower_count = most_recent.follower_count
            week_entry.save()
        except PeriodicRanking.DoesNotExist:
            PeriodicRanking.objects.create(
                track = track,
                type = 'ALLTIME',
                jam_points = jam_points,
                initial_playback_count = all_time.playback_count,
                initial_follower_count = all_time.follower_count,
                current_playback_count = most_recent.playback_count,
                current_follower_count = most_recent.follower_count
            )

# @shared_task
# def update_user_jam_points():
#     entry_points = ContestEntry.objects.values('user__id').annotate(total_jam_points=Sum('jam_points'))
#     # entry_points = ContestEntry.objects.values('user__username').annotate(total_jam_points=Sum('jam_points'))
#     for i, point in enumerate(entry_points):
#         user = Profile.objects.get(pk=point['user__id'])
#         user.jam_points = point['total_jam_points']
#         print "{}: Updating points for user: {} with points: {}".format(i, user.username, point['total_jam_points'])
#         user.save()
@shared_task
def update_user_jam_points():
    profiles = Profile.objects.all()
    for prof in profiles:
        entries = ContestEntry.objects.filter(user=prof)
        if len(entries) == 0:
            print "Found no contest entries for that user."
            continue
        else:
            sum = reduce(lambda x, jam: x + jam.jam_points, entries, 0)
            prof.jam_points = sum
            prof.save()

@shared_task
def start_contest(contest_id):
    '''
    from datetime import datetime
    from pytz import timezone
    eastern = timezone=('US/Eastern')
    date = datetime(year=, month=, ..., tzinfo=eastern)
    start_contest.apply_async(eta=date, args=(x,))
    For some reason this is running 4 minutes back on my vagrant
    '''
    contest = Contest.objects.get(id=contest_id)
    entries = contest.entries
    for entry in entries:
        try:
            new_track = client.get('/tracks/{}'.format(entry.track.sc_id))
            new_user = client.get('/users/{}'.format(entry.track.user.sc_id))
            entry.initial_playback_count = new_track.playback_count
            entry.initial_follower_count = new_user.followers_count
            entry.current_playback_count = new_track.playback_count
            entry.current_follower_count = new_user.followers_count
            entry.is_active = True
            entry.jam_points = 0.0
            entry.save()
        except HTTPError as e:
            print "Could not find track with id: {}".format(entry.track.sc_id)
            print "Error: {}".format(e)
            entry.is_active = True
            entry.jam_points = 0.0
            entry.save()
    contest.is_live = True
    contest.save()

@shared_task
def end_contest(contest_id):
    contest = Contest.objects.get(id=contest_id)
    entries = contest.entries
    for entry in entries:
        try:
            new_track = client.get('/tracks/{}'.format(entry.track.sc_id))
            new_user = client.get('/users/{}'.format(entry.track.user.sc_id))

            new_jam_points = calculate_jam_points(entry.initial_playback_count,
                                                      entry.initial_follower_count,
                                                      new_track.playback_count,
                                                      new_user.followers_count)
            entry.jam_points = new_jam_points
            entry.current_playback_count = new_track.playback_count
            entry.current_follower_count = new_user.followers_count
            entry.is_active = False
            entry.save()
        except HTTPError as e:
            print 'Error getting track with id: {}'.format(entry.track.sc_id)
            print 'ERROR: {}'.format(e)
            entry.is_active = False
            entry.save()
    contest.is_live = False
    contest.save()
