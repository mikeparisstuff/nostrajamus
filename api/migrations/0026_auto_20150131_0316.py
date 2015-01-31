# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0025_profile_jam_points'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='jam_points',
            field=models.IntegerField(default=0, db_index=True),
            preserve_default=True,
        ),
        migrations.AlterOrderWithRespectTo(
            name='contestentry',
            order_with_respect_to='contest',
        ),
    ]
