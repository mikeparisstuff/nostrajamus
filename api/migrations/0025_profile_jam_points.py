# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0024_auto_20150131_0222'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='jam_points',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
    ]
