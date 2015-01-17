# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_remove_contest_num_entrants'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='contests',
            field=models.ManyToManyField(to='api.Contest', null=True, blank=True),
            preserve_default=True,
        ),
    ]
