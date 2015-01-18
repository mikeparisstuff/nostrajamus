# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_sctrack_policy'),
    ]

    operations = [
        migrations.AddField(
            model_name='sctrack',
            name='kind',
            field=models.CharField(max_length=16, null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='sctrack',
            name='purchase_title',
            field=models.CharField(max_length=64, null=True, blank=True),
            preserve_default=True,
        ),
    ]
