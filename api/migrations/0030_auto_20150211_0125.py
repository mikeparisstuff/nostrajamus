# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0029_auto_20150210_2008'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contestentry',
            name='is_active',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
