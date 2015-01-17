# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import django.utils.timezone
import api.models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(default=django.utils.timezone.now, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(help_text='Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.', unique=True, max_length=30, verbose_name='username', validators=[django.core.validators.RegexValidator('^[\\w.@+-]+$', 'Enter a valid username.', 'invalid')])),
                ('first_name', models.CharField(max_length=30, verbose_name='first name', blank=True)),
                ('last_name', models.CharField(max_length=30, verbose_name='last name', blank=True)),
                ('email', models.EmailField(max_length=75, verbose_name='email address', blank=True)),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('profile_picture', models.FileField(null=True, upload_to=api.models.get_profile_picture_upload_path, blank=True)),
            ],
            options={
                'abstract': False,
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Contest',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('title', models.CharField(default=b'', max_length=100, blank=True)),
                ('num_entrants', models.IntegerField(default=0)),
                ('description', models.CharField(default=b'', max_length=256, blank=True)),
                ('prize', models.CharField(default=b'', max_length=32, blank=True)),
                ('is_live', models.BooleanField(default=True)),
            ],
            options={
                'ordering': ('created_at',),
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ContestEntry',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('initial_playback_count', models.IntegerField()),
                ('initial_follower_count', models.IntegerField()),
                ('contest', models.ForeignKey(to='api.Contest')),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='SCPeriodicPlayCount',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('playback_count', models.IntegerField()),
                ('follower_count', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='SCTrack',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('sc_id', models.IntegerField(unique=True)),
                ('sc_created_at', models.DateTimeField()),
                ('sc_user_id', models.IntegerField()),
                ('duration', models.IntegerField(default=0)),
                ('commentable', models.BooleanField(default=False)),
                ('state', models.CharField(default=b'', max_length=32, blank=True)),
                ('sharing', models.CharField(default=b'', max_length=32, blank=True)),
                ('tag_list', models.CharField(default=b'', max_length=256, blank=True)),
                ('permalink', models.CharField(default=b'', max_length=256, blank=True)),
                ('permalink_url', models.URLField(default=b'', blank=True)),
                ('description', models.CharField(max_length=256, null=True, blank=True)),
                ('streamable', models.BooleanField(default=False)),
                ('downloadable', models.BooleanField(default=False)),
                ('genre', models.CharField(default=b'', max_length=128, null=True, blank=True)),
                ('release', models.IntegerField(null=True, blank=True)),
                ('purchase_url', models.URLField(default=b'', null=True, blank=True)),
                ('label_id', models.IntegerField(null=True, blank=True)),
                ('label_name', models.CharField(max_length=128, null=True, blank=True)),
                ('isrc', models.CharField(max_length=128, null=True, blank=True)),
                ('video_url', models.URLField(null=True, blank=True)),
                ('track_type', models.CharField(max_length=32)),
                ('key_signature', models.CharField(default=b'', max_length=128, null=True, blank=True)),
                ('bpm', models.IntegerField(null=True, blank=True)),
                ('title', models.CharField(max_length=128)),
                ('release_year', models.IntegerField(null=True, blank=True)),
                ('release_month', models.IntegerField(null=True, blank=True)),
                ('release_day', models.IntegerField(null=True, blank=True)),
                ('original_format', models.CharField(default=b'', max_length=32, blank=True)),
                ('original_content_size', models.IntegerField()),
                ('license', models.CharField(max_length=32)),
                ('uri', models.URLField()),
                ('artwork_url', models.URLField(null=True, blank=True)),
                ('waveform_url', models.URLField()),
                ('stream_url', models.URLField()),
                ('download_url', models.URLField()),
                ('playback_count', models.IntegerField()),
                ('download_count', models.IntegerField()),
                ('favoritings_count', models.IntegerField()),
                ('comment_count', models.IntegerField()),
                ('attachments_uri', models.URLField(null=True, blank=True)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='SCUser',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('sc_id', models.IntegerField(unique=True)),
                ('permalink', models.CharField(max_length=64)),
                ('username', models.CharField(max_length=64)),
                ('uri', models.URLField()),
                ('permalink_url', models.URLField()),
                ('avatar_url', models.URLField()),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='WatchedSong',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('initial_playback_count', models.IntegerField()),
                ('initial_follower_count', models.IntegerField()),
                ('track', models.ForeignKey(to='api.SCTrack')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='sctrack',
            name='user',
            field=models.ForeignKey(blank=True, to='api.SCUser', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='scperiodicplaycount',
            name='track',
            field=models.ForeignKey(to='api.SCTrack'),
            preserve_default=True,
        ),
        migrations.AlterOrderWithRespectTo(
            name='scperiodicplaycount',
            order_with_respect_to='track',
        ),
        migrations.AddField(
            model_name='contestentry',
            name='track',
            field=models.ForeignKey(to='api.SCTrack'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='contestentry',
            name='user',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='profile',
            name='contests',
            field=models.ManyToManyField(to='api.Contest'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='profile',
            name='groups',
            field=models.ManyToManyField(related_query_name='user', related_name='user_set', to='auth.Group', blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of his/her group.', verbose_name='groups'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='profile',
            name='user_permissions',
            field=models.ManyToManyField(related_query_name='user', related_name='user_set', to='auth.Permission', blank=True, help_text='Specific permissions for this user.', verbose_name='user permissions'),
            preserve_default=True,
        ),
    ]
