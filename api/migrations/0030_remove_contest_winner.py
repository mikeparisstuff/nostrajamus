# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0029_contest_winner'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='contest',
            name='winner',
        ),
    ]
