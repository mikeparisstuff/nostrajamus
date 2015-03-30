# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0035_likedtrack'),
    ]

    operations = [
        migrations.RenameField(
            model_name='likedtrack',
            old_name='track_ranking',
            new_name='track',
        ),
    ]
