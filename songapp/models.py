from django.db import models

class Song(models.Model):
    name = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    cover_image = models.ImageField(upload_to='covers/')
    song_file = models.FileField(upload_to='songs/')
    duration = models.CharField(max_length=10, default="04:00", blank=True)  # Default to 4 minutes

    def __str__(self):
        return f"{self.name} - {self.artist} ({self.duration})"
