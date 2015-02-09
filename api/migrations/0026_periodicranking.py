# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0025_auto_20150202_1850'),
    ]

    operations = [
        migrations.CreateModel(
            name='PeriodicRanking',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('jam_points', models.DecimalField(default=0, max_digits=8, decimal_places=1)),
                ('type', models.CharField(default=b'WEEKLY', max_length=16, choices=[(b'WEEKLY', b'Weekly'), (b'MONTHLY', b'Monthly'), (b'ALLTIME', b'AllTime')])),
                ('initial_playback_count', models.IntegerField()),
                ('initial_follower_count', models.IntegerField()),
                ('current_playback_count', models.IntegerField(default=0)),
                ('current_follower_count', models.IntegerField(default=0)),
                ('track', models.ForeignKey(to='api.SCTrack')),
            ],
            options={
                'ordering': ('-jam_points',),
            },
            bases=(models.Model,),
        ),
    ]
