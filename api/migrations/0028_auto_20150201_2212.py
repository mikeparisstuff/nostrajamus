# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0027_resetpasswordtoken'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='contestentry',
            options={'ordering': '-jam_points'},
        ),
    ]
