# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_auto_20150120_0626'),
    ]

    operations = [
        migrations.AddField(
            model_name='scperiodicplaycount',
            name='jam_points',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
    ]
