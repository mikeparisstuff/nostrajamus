# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0033_sctrack_jamus_playback_count'),
    ]

    operations = [
        migrations.AlterField(
            model_name='periodicranking',
            name='type',
            field=models.CharField(default=b'WEEKLY', max_length=16, choices=[(b'DAILY', b'Daily'), (b'WEEKLY', b'Weekly'), (b'MONTHLY', b'Monthly'), (b'ALLTIME', b'AllTime')]),
            preserve_default=True,
        ),
    ]
