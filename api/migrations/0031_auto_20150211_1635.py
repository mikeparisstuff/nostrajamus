# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0030_auto_20150211_0125'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contest',
            name='is_live',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
