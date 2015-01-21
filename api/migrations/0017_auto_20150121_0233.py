# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_scperiodicplaycount_jam_points'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='scperiodicplaycount',
            name='jam_points',
        ),
        migrations.AddField(
            model_name='contestentry',
            name='jam_points',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
    ]
