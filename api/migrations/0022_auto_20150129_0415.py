# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0021_contestidea'),
    ]

    operations = [
        migrations.AddField(
            model_name='contestentry',
            name='current_follower_count',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='contestentry',
            name='current_playback_count',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
    ]
