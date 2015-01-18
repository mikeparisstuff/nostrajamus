# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_sctrack_embeddable_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='sctrack',
            name='sc_last_modified',
            field=models.DateTimeField(null=True, blank=True),
            preserve_default=True,
        ),
    ]
