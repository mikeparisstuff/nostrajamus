from django.contrib import admin
from api.models import Profile, Contest, SCTrack, SCPeriodicPlayCount, WatchedSong, ContestEntry, SCUser, Feedback, ResetPasswordToken, PeriodicRanking, LikedTrack

# Register your models here.

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'username', 'email', 'jam_points')
    search_fields = ['first_name', 'last_name', 'username', 'email']

class ContestAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'num_entries', 'start_time', 'end_time')

class SCTrackAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'stream_url', 'jamus_playback_count', 'created_at')

class SCPeriodicPlayCountAdmin(admin.ModelAdmin):
    list_display = ('id', 'track', 'playback_count', 'follower_count')

class WatchedSongAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'track', 'initial_playback_count', 'initial_follower_count', 'current_playback_count', 'current_follower_count', 'is_active')

class ContestEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'track', 'contest', 'jam_points', 'initial_playback_count', 'initial_follower_count', 'current_playback_count', 'current_follower_count', 'is_active')

class SCUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'sc_id', 'username', 'permalink_url')

class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'created_at')

class ResetTokenAdmin(admin.ModelAdmin):
    list_display = ('id', 'token', 'is_active')

class PeriodicRankingAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'track', 'initial_playback_count', 'current_playback_count', 'jam_points')

class LikedTrackAdmin(admin.ModelAdmin):
    list_display = ('id', 'track', 'user')

admin.site.register(Profile, ProfileAdmin)
admin.site.register(SCTrack, SCTrackAdmin)
admin.site.register(Contest, ContestAdmin)
admin.site.register(SCPeriodicPlayCount, SCPeriodicPlayCountAdmin)
admin.site.register(WatchedSong, WatchedSongAdmin)
admin.site.register(ContestEntry, ContestEntryAdmin)
admin.site.register(SCUser, SCUserAdmin)
admin.site.register(Feedback, FeedbackAdmin)
admin.site.register(ResetPasswordToken, ResetTokenAdmin)
admin.site.register(PeriodicRanking, PeriodicRankingAdmin)
admin.site.register(LikedTrack, LikedTrackAdmin)