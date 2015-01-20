# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_auto_20150120_0623'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sctrack',
            name='release',
            field=models.CharField(max_length=256, null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='sctrack',
            name='tag_list',
            field=models.CharField(default=b'', max_length=512, blank=True),
            preserve_default=True,
        ),
    ]
