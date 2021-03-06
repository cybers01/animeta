# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-07-26 22:01
from __future__ import unicode_literals

from django.db import migrations


def fill_record_ids(apps, schema_editor):
    Record = apps.get_model('record', 'Record')
    History = apps.get_model('record', 'History')
    for record in Record.objects.all():
        History.objects.filter(user_id=record.user_id, work_id=record.work_id).update(record_prep_id=record.id)


class Migration(migrations.Migration):

    dependencies = [
        ('record', '0003_history_record'),
    ]

    operations = [
        migrations.RunPython(fill_record_ids),
    ]
