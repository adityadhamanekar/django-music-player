# Generated by Django 5.0.6 on 2025-03-21 15:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("songapp", "0002_alter_song_duration"),
    ]

    operations = [
        migrations.AlterField(
            model_name="song",
            name="duration",
            field=models.CharField(blank=True, default="04:00", max_length=10),
        ),
    ]
