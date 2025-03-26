from django.urls import path
from . import views

urlpatterns = [
    
    path('', views.home, name ='home'),
     path("delete-song/", views.delete_song, name="delete_song"),
    
]
