# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_auto_20150121_1722'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contestentry',
            name='jam_points',
            field=models.DecimalField(default=0, max_digits=9, decimal_places=1),
            preserve_default=True,
        ),
    ]
