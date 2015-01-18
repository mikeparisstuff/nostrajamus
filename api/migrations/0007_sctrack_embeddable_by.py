# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_auto_20150118_2110'),
    ]

    operations = [
        migrations.AddField(
            model_name='sctrack',
            name='embeddable_by',
            field=models.CharField(max_length=16, null=True, blank=True),
            preserve_default=True,
        ),
    ]
