from __future__ import absolute_import

from api.models import SCTrack, SCUser, SCPeriodicPlayCount, ContestEntry, Profile, Contest
from django.db.models import Sum
from requests.exceptions import HTTPError
from celery import shared_task
import soundcloud

client = soundcloud.Client(client_id='011325f9ff53871e49215492068499c6')

def calculate_jam_points(initial_playcount, initial_followers, final_playcount, final_followers):
    initial_playcount = float(initial_playcount)
    initial_followers = float(initial_followers)
    final_playcount = float(final_playcount)
    final_followers = float(final_followers)
    follow_unit = final_followers * ((final_followers - initial_followers)/initial_followers)
    playcount_unit = (final_playcount ** (7.0/8.0)) * (((final_playcount - initial_playcount)/initial_playcount) ** ( 8.0/7.0))
    denom = (initial_playcount ** (0.5)) + (initial_followers ** (0.5))
    jam_points = (follow_unit + playcount_unit)/denom
    return (jam_points**0.5)


@shared_task
def update_playcount():
    tracks = SCTrack.objects.all()
    for track in tracks:
        try:
            new_track = client.get('/tracks/{}'.format(track.sc_id))
            new_user = client.get('/users/{}'.format(track.user.sc_id))
            all_entries = ContestEntry.objects.filter(track=track)
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

@shared_task
def update_user_jam_points():
    entry_points = ContestEntry.objects.values('user__username').annotate(total_jam_points=Sum('jam_points'))
    for i, point in enumerate(entry_points):
        user = Profile.objects.get(username=point['user__username'])
        user.jam_points = point['total_jam_points']
        print "{}: Updating points for user: {} with points: {}".format(i, user.username, point['total_jam_points'])
        user.save()

@shared_task
def start_contest(contest_id):
    contest = Contest.objects.get(id=contest_id)
    entries = contest.entries
    for entry in entries:
        new_track = client.get('/tracks/{}'.format(entry.track.sc_id))
        new_user = client.get('/users/{}'.format(entry.track.user.sc_id))
        entry.initial_playback_count = new_track.playback_count
        entry.initial_follower_count = new_user.followers_count
        entry.jam_points = 0.0
        entry.save()

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
    contest.is_live = False
    contest.save()
