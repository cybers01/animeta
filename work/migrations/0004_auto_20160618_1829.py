# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-06-18 18:29
from __future__ import unicode_literals

from django.db import migrations

import yaml
from animeta.utils.table import Period


def fill_image_filename(apps, schema_editor):
    Work = apps.get_model('work', 'Work')
    for work in Work.objects.exclude(raw_metadata=None):
        if work.image_filename or not work.raw_metadata:
            continue
        metadata = yaml.load(work.raw_metadata)
        if metadata:
            period = Period.parse(metadata['periods'][0])
            work.image_filename = '%s/images/thumb/%s' % (period, metadata['image'])
            work.save()


class Migration(migrations.Migration):

    dependencies = [
        ('work', '0003_work_image_filename'),
    ]

    operations = [
        migrations.RunPython(fill_image_filename),
    ]
