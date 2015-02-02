# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0024_auto_20150202_1830'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contestentry',
            name='jam_points',
            field=models.DecimalField(default=0, max_digits=8, decimal_places=1),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='profile',
            name='jam_points',
            field=models.DecimalField(default=0, max_digits=8, decimal_places=1, db_index=True),
            preserve_default=True,
        ),
    ]
