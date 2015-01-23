# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_auto_20150121_1722'),
    ]

    operations = [
        migrations.CreateModel(
            name='ContestMembership',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('contest', models.ForeignKey(to='api.Contest')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='profile',
            name='contests',
        ),
        migrations.AddField(
            model_name='contest',
            name='creator',
            field=models.ForeignKey(related_name='owned_contest_set', default=None, blank=True, to=settings.AUTH_USER_MODEL, null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='contest',
            name='entry_fee',
            field=models.IntegerField(default=0, choices=[(0, b'Free'), (1, b'$1'), (2, b'$2'), (5, b'$5'), (10, b'$10')]),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='contest',
            name='max_entries',
            field=models.IntegerField(default=-1),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='contest',
            name='opponent_type',
            field=models.CharField(default=b'ANYONE', max_length=8, choices=[(b'ANYONE', b'Anyone'), (b'FRIENDS', b'Friends')]),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='contest',
            name='prize_payout',
            field=models.CharField(default=b'WINNERTAKESALL', max_length=16, choices=[(b'WINNERTAKESALL', b'Winner'), (b'TOP3', b'Top 3'), (b'TOPTHIRD', b'Top Third')]),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='contest',
            name='songs_per_entrant',
            field=models.IntegerField(default=1, choices=[(1, b'One'), (2, b'Two'), (3, b'Three'), (4, b'Four'), (5, b'Five'), (6, b'Six'), (7, b'Seven'), (8, b'Eight'), (9, b'Nine'), (10, b'Ten')]),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='contest',
            name='type',
            field=models.CharField(default=b'POOL', max_length=16, choices=[(b'HEADTOHEAD', b'Head To Head'), (b'POOL', b'Pool')]),
            preserve_default=True,
        ),
    ]
