# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0032_auto_20150202_1530'),
    ]

    operations = [
        migrations.AddField(
            model_name='contest',
            name='editors_pick',
            field=models.BigIntegerField(null=True, blank=True),
            preserve_default=True,
        ),
    ]
