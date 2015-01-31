# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import api.models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0023_reward_userreward'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='contest',
            options={'ordering': ('-start_time',)},
        ),
        migrations.AddField(
            model_name='contest',
            name='contest_picture',
            field=models.FileField(null=True, upload_to=api.models.get_contest_picture_upload_path, blank=True),
            preserve_default=True,
        ),
    ]
