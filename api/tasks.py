from __future__ import absolute_import

from api.models import SCTrack, SCUser, SCPeriodicPlayCount
from celery import shared_task
import soundcloud

client = soundcloud.Client(client_id='011325f9ff53871e49215492068499c6')

@shared_task
def update_playcount():
    tracks = SCTrack.objects.all()
    for track in tracks:
        new_track = client.get('/tracks/{}'.format(track.sc_id))
        new_user = client.get('/users/{}'.format(track.user.sc_id))
        play_count = SCPeriodicPlayCount.objects.create(
            playback_count=new_track.playback_count,
            follower_count=new_user.followers_count,
            track=track
        )
