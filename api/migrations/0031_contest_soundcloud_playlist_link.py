# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0030_remove_contest_winner'),
    ]

    operations = [
        migrations.AddField(
            model_name='contest',
            name='soundcloud_playlist_link',
            field=models.URLField(null=True, blank=True),
            preserve_default=True,
        ),
    ]
