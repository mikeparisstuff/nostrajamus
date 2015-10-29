# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0037_followingrelation'),
    ]

    operations = [
        migrations.RenameField(
            model_name='followingrelation',
            old_name='followedUser',
            new_name='followed_user',
        ),
    ]
