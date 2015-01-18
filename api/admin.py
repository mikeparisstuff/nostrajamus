from django.contrib import admin
from api.models import Profile, Contest, SCTrack, SCPeriodicPlayCount, WatchedSong, ContestEntry, SCUser, Feedback

# Register your models here.

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'username', 'email')

class ContestAdmin(admin.ModelAdmin):
    list_display = ('title', 'num_entries')

class SCTrackAdmin(admin.ModelAdmin):
    list_display = ('title', 'stream_url', 'created_at')

class SCPeriodicPlayCountAdmin(admin.ModelAdmin):
    list_display = ('track', 'playback_count', 'follower_count')

class WatchedSongAdmin(admin.ModelAdmin):
    list_display = ('user', 'track', 'initial_playback_count', 'initial_follower_count', 'is_active')

class ContestEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'track', 'contest', 'initial_playback_count', 'initial_follower_count', 'is_active')

class SCUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'sc_id', 'username', 'permalink_url')

class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'created_at')

admin.site.register(Profile, ProfileAdmin)
admin.site.register(SCTrack, SCTrackAdmin)
admin.site.register(Contest, ContestAdmin)
admin.site.register(SCPeriodicPlayCount, SCPeriodicPlayCountAdmin)
admin.site.register(WatchedSong, WatchedSongAdmin)
admin.site.register(ContestEntry, ContestEntryAdmin)
admin.site.register(SCUser, SCUserAdmin)
admin.site.register(Feedback, FeedbackAdmin)