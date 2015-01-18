# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_auto_20150118_2117'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sctrack',
            name='release',
            field=models.CharField(default='', max_length=255, blank=True),
            preserve_default=False,
        ),
    ]
