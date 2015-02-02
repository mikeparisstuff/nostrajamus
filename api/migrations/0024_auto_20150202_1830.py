# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import api.models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0023_merge'),
    ]

    operations = [
        migrations.CreateModel(
            name='ResetPasswordToken',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('email', models.EmailField(max_length=75)),
                ('token', models.CharField(max_length=16)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Reward',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('title', models.CharField(max_length=128)),
                ('description', models.CharField(max_length=256)),
                ('fa_string', models.CharField(default=b'fa-trophy', max_length=64)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='UserReward',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('rewards', models.ForeignKey(to='api.Reward')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.DeleteModel(
            name='ContestIdea',
        ),
        migrations.AlterModelOptions(
            name='contest',
            options={'ordering': ('-start_time',)},
        ),
        migrations.AlterModelOptions(
            name='contestentry',
            options={'ordering': '-jam_points'},
        ),
        migrations.AddField(
            model_name='contest',
            name='contest_picture',
            field=models.FileField(null=True, upload_to=api.models.get_contest_picture_upload_path, blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='contest',
            name='editors_pick',
            field=models.BigIntegerField(null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='contest',
            name='soundcloud_playlist_link',
            field=models.URLField(null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='profile',
            name='jam_points',
            field=models.IntegerField(default=0, db_index=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='profile',
            name='location',
            field=models.CharField(default=b'', max_length=512),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='watchedsong',
            name='current_follower_count',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='watchedsong',
            name='current_playback_count',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='contest',
            name='end_time',
            field=models.DateTimeField(null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='contest',
            name='start_time',
            field=models.DateTimeField(null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='contestentry',
            name='jam_points',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='sctrack',
            name='sc_id',
            field=models.BigIntegerField(unique=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='sctrack',
            name='sc_user_id',
            field=models.BigIntegerField(),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='scuser',
            name='sc_id',
            field=models.BigIntegerField(unique=True),
            preserve_default=True,
        ),
        migrations.AlterOrderWithRespectTo(
            name='contestentry',
            order_with_respect_to='contest',
        ),
    ]
