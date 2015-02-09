# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0026_periodicranking'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='periodicranking',
            options={'ordering': ('type', '-jam_points')},
        ),
    ]
