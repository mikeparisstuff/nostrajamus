from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class BaseModel(models.Model):

    created_at = models.DateTimeField(
        auto_now_add=True,
        blank = True,
        null = True
    )

    modified_at = models.DateTimeField(
        auto_now=True,
        blank=True,
        null=True
    )

    class Meta:
        abstract = True
################# CONTESTS ##########################

class Contest(BaseModel):

    title = models.CharField(
        max_length=100,
        blank=True,
        default = ''
    )

    @property
    def num_entries(self):
        return self.contestentry_set.count()

    @property
    def entries(self):
        return self.contestentry_set.all()

    description = models.CharField(
        max_length=256,
        blank = True,
        default = ''
    )

    prize = models.CharField(
        max_length=32,
        blank=True,
        default=''
    )

    # True if the contest is live else False
    is_live = models.BooleanField(
        default = True
    )

    start_time = models.DateTimeField(
        auto_now_add=True,
        blank = True,
        null = True
    )

    end_time = models.DateTimeField(
        auto_now_add=True,
        blank = True,
        null = True
    )

    class Meta:
        ordering = ('created_at',)

################### PROFILE ##################################

def get_profile_picture_upload_path(self, filename):
    return 'profiles/profile_{}/profile_picture.jpg'.format(self.username)

class Profile(AbstractUser):
    '''
    Registered nostrJAMus User
    '''
    profile_picture = models.FileField(
        upload_to = get_profile_picture_upload_path,
        null = True,
        blank = True
    )

    contests = models.ManyToManyField(
        Contest,
        blank=True,
        null=True
    )


class SCUser(BaseModel):

     sc_id = models.IntegerField(
         unique=True
     )

     permalink = models.CharField(
         max_length=64
     )

     username = models.CharField(
         max_length=64
     )

     kind = models.CharField(
         max_length=32,
         blank=True,
         null=True
     )

     uri = models.URLField()

     permalink_url = models.URLField()

     avatar_url = models.URLField()

'''
{
  "id": 13158665,
  "created_at": "2011/04/06 15:37:43 +0000",
  "user_id": 3699101,
  "duration": 18109,
  "commentable": true,
  "state": "finished",
  "sharing": "public",
  "tag_list": "soundcloud:source=iphone-record",
  "permalink": "munching-at-tiannas-house",
  "description": null,
  "streamable": true,
  "downloadable": true,
  "genre": null,
  "release": null,
  "purchase_url": null,
  "label_id": null,
  "label_name": null,
  "isrc": null,
  "video_url": null,
  "track_type": "recording",
  "key_signature": null,
  "bpm": null,
  "title": "Munching at Tiannas house",
  "release_year": null,
  "release_month": null,
  "release_day": null,
  "original_format": "m4a",
  "original_content_size": 10211857,
  "license": "all-rights-reserved",
  "uri": "http://api.soundcloud.com/tracks/13158665",
  "permalink_url": "http://soundcloud.com/user2835985/munching-at-tiannas-house",
  "artwork_url": null,
  "waveform_url": "http://w1.sndcdn.com/fxguEjG4ax6B_m.png",
  "user": {
    "id": 3699101,
    "permalink": "user2835985",
    "username": "user2835985",
    "uri": "http://api.soundcloud.com/users/3699101",
    "permalink_url": "http://soundcloud.com/user2835985",
    "avatar_url": "http://a1.sndcdn.com/images/default_avatar_large.png?142a848"
  },
  "stream_url": "http://api.soundcloud.com/tracks/13158665/stream",
  "download_url": "http://api.soundcloud.com/tracks/13158665/download",
  "playback_count": 0,
  "download_count": 0,
  "favoritings_count": 0,
  "comment_count": 0,
  "created_with": {
    "id": 124,
    "name": "SoundCloud iPhone",
    "uri": "http://api.soundcloud.com/apps/124",
    "permalink_url": "http://soundcloud.com/apps/iphone"
  },
  "attachments_uri": "http://api.soundcloud.com/tracks/13158665/attachments"
}
'''
class SCTrack(BaseModel):

    sc_id = models.IntegerField(
        unique=True
    )

    sc_created_at = models.DateTimeField()

    sc_user_id = models.IntegerField()

    user = models.ForeignKey(
        SCUser,
        blank=True,
        null=True
    )

    duration = models.IntegerField(
        default=0
    )

    commentable = models.BooleanField(
        default=False
    )

    state = models.CharField(
        max_length=32,
        blank=True,
        default=''
    )

    sharing = models.CharField(
        max_length=32,
        blank=True,
        default=''
    )

    tag_list = models.CharField(
        max_length=512,
        blank=True,
        default=''
    )

    permalink = models.CharField(
        max_length=256,
        blank=True,
        default=''
    )

    permalink_url = models.URLField(
        blank=True,
        default = ''
    )

    description = models.CharField(
        max_length=1024,
        blank=True,
        null=True
    )

    streamable = models.BooleanField(
        default=False
    )

    downloadable = models.BooleanField(
        default=False
    )

    genre = models.CharField(
        max_length=128,
        blank=True,
        null=True,
        default=''
    )

    #The release number of the track
    release = models.CharField(max_length=256, blank=True, null=True)

    purchase_url = models.URLField(
        blank=True,
        null=True,
        default=''
    )

    label_id = models.IntegerField(
        blank=True,
        null=True
    )

    label_name = models.CharField(
        max_length=128,
        blank=True,
        null=True
    )

    isrc = models.CharField(
        max_length=128,
        blank = True,
        null = True
    )

    video_url = models.URLField(
        blank=True,
        null=True
    )

    track_type = models.CharField(
        max_length=32,
        blank=True,
        null=True
    )

    key_signature = models.CharField(
        max_length=128,
        blank=True,
        null=True,
        default=''
    )

    bpm = models.IntegerField(
        blank=True,
        null=True
    )

    title = models.CharField(
        max_length=128
    )

    release_year = models.IntegerField(
        blank=True,
        null=True
    )

    release_month = models.IntegerField(
        blank=True,
        null=True
    )

    release_day = models.IntegerField(
        blank=True,
        null=True
    )

    original_format = models.CharField(
        max_length=32,
        blank=True,
        default = ''
    )

    original_content_size = models.IntegerField()

    license = models.CharField(
        max_length=32
    )

    uri = models.URLField()

    artwork_url = models.URLField(
        blank = True,
        null = True
    )

    waveform_url = models.URLField()

    #
    # user = SCUser

    stream_url = models.URLField()

    download_url = models.URLField()

    playback_count = models.IntegerField()

    download_count = models.IntegerField()

    favoritings_count = models.IntegerField()

    comment_count = models.IntegerField()

    attachments_uri = models.URLField(
        blank=True,
        null=True
    )

    policy = models.CharField(
        max_length=32,
        blank = True,
        null = True
    )

    purchase_title = models.CharField(
        max_length=64,
        blank = True,
        null = True
    )

    kind = models.CharField(
        max_length=16,
        blank=True,
        null=True
    )

    embeddable_by = models.CharField(
        max_length=16,
        blank=True,
        null=True
    )

    sc_last_modified = models.DateTimeField(
        blank=True,
        null=True
    )


class SCPeriodicPlayCount(BaseModel):

    playback_count = models.IntegerField()

    follower_count = models.IntegerField()

    track = models.ForeignKey(
        SCTrack
    )

    class Meta:
        order_with_respect_to = 'track'

class WatchedSong(BaseModel):

    # True if the user is actively watching the song else False
    is_active = models.BooleanField(
        default = True
    )

    user = models.ForeignKey(
        Profile
    )

    track = models.ForeignKey(
        SCTrack
    )

    initial_playback_count = models.IntegerField()

    initial_follower_count = models.IntegerField()

class ContestEntry(BaseModel):
    '''
    Like a watched song but for contest entry songs only
    '''

    is_active = models.BooleanField(
        default = True
    )

    # User who entered the song
    user = models.ForeignKey(
        Profile
    )

    # Contest that the song is entered in
    contest = models.ForeignKey(
        Contest
    )

    # Track the user has entered
    track = models.ForeignKey(
        SCTrack
    )

    jam_points = models.DecimalField(
        default = 0,
        max_digits=9,
        decimal_places=1
    )

    initial_playback_count = models.IntegerField()

    initial_follower_count = models.IntegerField()

    current_playback_count = models.IntegerField(default=0)

    current_follower_count = models.IntegerField(default=0)

class Feedback(BaseModel):

    text = models.CharField(
        max_length=512,
        blank=True,
        default=''
    )

    name = models.CharField(
        max_length=64,
        blank=True,
        default=''
    )

    email = models.EmailField(
        blank=True,
        null=True
    )

class ContestIdea(BaseModel):

    idea = models.CharField(
        max_length=256,
        blank=True,
        default=''
    )