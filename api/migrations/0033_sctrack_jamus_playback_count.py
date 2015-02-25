# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0032_profile_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='sctrack',
            name='jamus_playback_count',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
    ]
