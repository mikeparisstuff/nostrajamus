# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0020_auto_20150122_0805'),
    ]

    operations = [
        migrations.AddField(
            model_name='contestentry',
            name='current_follower_count',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='contestentry',
            name='current_playback_count',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='watchedsong',
            name='current_follower_count',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='watchedsong',
            name='current_playback_count',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='sctrack',
            name='sc_id',
            field=models.BigIntegerField(unique=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='sctrack',
            name='sc_user_id',
            field=models.BigIntegerField(),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='scuser',
            name='sc_id',
            field=models.BigIntegerField(unique=True),
            preserve_default=True,
        ),
    ]
