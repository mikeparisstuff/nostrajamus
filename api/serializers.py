__author__ = 'MichaelParis'

from api.models import Profile, Contest, SCTrack, SCPeriodicPlayCount, SCUser, ContestEntry, Feedback
from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from datetime import datetime

class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Profile
        fields = ('url', 'username', 'first_name', 'last_name', 'email', 'password')

class ContestEntrySerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = ContestEntry

class ContestSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Contest
        fields = ('title', 'num_entries', 'description', 'prize', 'is_live')

def reformat_date(date_str):
    return datetime.strptime(date_str[:-6], "%Y/%m/%d %H:%M:%S").strftime("%Y-%m-%d %H:%M:%S")

class SCUserSerializer(serializers.HyperlinkedModelSerializer):

    def to_internal_value(self, data):
        curated_data = data
        curated_data['sc_id'] = data['id']
        del(curated_data['id'])
        return curated_data

    def create(self, validated_data):
        return SCUser.objects.create(sc_id = validated_data['sc_id'],
                                     permalink = validated_data['permalink'],
                                     username = validated_data['username'],
                                     kind = validated_data.get('kind'),
                                     uri = validated_data.get('uri'),
                                     permalink_url = validated_data['permalink_url'],
                                     avatar_url = validated_data['avatar_url'])

    class Meta:
        model = SCUser

class SCTrackSerializer(serializers.HyperlinkedModelSerializer):

    user = SCUserSerializer()

    def to_internal_value(self, data):
        curated_data = data
        curated_data['sc_created_at'] = reformat_date(data['created_at'])
        if 'last_modified' in data:
            curated_data['sc_last_modified'] = reformat_date(data['last_modified'])
        curated_data['sc_id'] = data['id']
        curated_data['sc_user_id'] = data['user_id']
        del(curated_data['created_at'])
        del(curated_data['id'])
        del(curated_data['user_id'])
        del(curated_data['last_modified'])
        if curated_data.has_key('created_with'):
            del(curated_data['created_with'])
        return curated_data

    def create(self, validated_data):
        # Get SCUser... Create SCTrack and return
        try:
            user = SCUser.objects.get(sc_id=validated_data['user']['id'])
        except SCUser.DoesNotExist:
            user = SCUserSerializer(data=validated_data['user'])
            if user.is_valid():
                user = user.save()
            else:
                raise ValidationError('User in SCTrack(id={}) did not pass validation'.format(validated_data['sc_id']))
        validated_data['user'] = user
        return SCTrack.objects.create(**validated_data)

    class Meta:
        model = SCTrack
        # fields = ('id', 'sc_id', 'title', 'stream_url', 'release_year')

class SCPeriodicPlayCountSerializer(serializers.HyperlinkedModelSerializer):

    track_title = serializers.ReadOnlyField(source='track.title')
    soundcloud_id = serializers.ReadOnlyField(source='track.sc_id')

    class Meta:
        model = SCPeriodicPlayCount
        fields = ('track_title', 'soundcloud_id', 'playback_count', 'follower_count', 'created_at', 'modified_at')

class FeedbackSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Feedback