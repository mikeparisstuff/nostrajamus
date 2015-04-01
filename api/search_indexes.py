__author__ = 'MichaelParis'
import datetime
from haystack import indexes
from api.models import SCTrack, Profile

class SCTrackIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, model_attr='title')
    upload_date = indexes.DateTimeField(model_attr='created_at')

    def get_model(self):
        return SCTrack

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.all()

class ProfileIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    first_name = indexes.CharField(model_attr='first_name')
    last_name = indexes.CharField(model_attr='last_name')
    created_at = indexes.DateTimeField(model_attr='date_joined')

    def get_model(self):
        return Profile

    def index_queryset(self, using=None):
        return self.get_model().objects.all()