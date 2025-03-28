# Generated by Django 5.0.6 on 2025-03-21 15:27

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Song",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("artist", models.CharField(max_length=255)),
                ("cover_image", models.ImageField(upload_to="covers/")),
                ("song_file", models.FileField(upload_to="songs/")),
                ("duration", models.CharField(max_length=10)),
            ],
        ),
    ]
