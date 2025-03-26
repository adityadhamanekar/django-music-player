from django.shortcuts import render, redirect
from .models import Song
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
from django.conf import settings

def home(request):
    if request.method == "POST":
        name = request.POST.get("name")
        artist = request.POST.get("artist")
        cover_image = request.FILES.get("cover_image")
        song_file = request.FILES.get("audio_file")

        if name and artist and cover_image and song_file:
            song = Song(name=name, artist=artist, cover_image=cover_image, song_file=song_file)
            song.save()  # ✅ Saving the song with the default duration
            return redirect("home")  # Reload the page after uploading

    songs = Song.objects.all()
    return render(request, "songapp/home.html", {"songs": songs})



  # Replace with your actual model

@csrf_exempt
def delete_song(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            song_name = data.get("song_name")

            # Find the song in the database
            song = Song.objects.filter(name=song_name).first()

            if song:
                # Get full paths for media files
                song_file_path = os.path.join(settings.MEDIA_ROOT, str(song.song_file))
                cover_image_path = os.path.join(settings.MEDIA_ROOT, str(song.cover_image))

                # Delete the song file if it exists
                if os.path.exists(song_file_path):
                    os.remove(song_file_path)

                # Delete the cover image if it exists
                if os.path.exists(cover_image_path):
                    os.remove(cover_image_path)

                # Remove the song entry from the database
                song.delete()

                return JsonResponse({"success": True})
            else:
                return JsonResponse({"success": False, "error": "Song not found"}, status=404)

        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)

    return JsonResponse({"success": False, "error": "Invalid request method"}, status=400)