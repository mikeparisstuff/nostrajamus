# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_sctrack_sc_last_modified'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sctrack',
            name='track_type',
            field=models.CharField(max_length=32, null=True, blank=True),
            preserve_default=True,
        ),
    ]
