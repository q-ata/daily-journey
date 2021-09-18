from django.shortcuts import render
from .serializers import ModelNameSerializer
from rest_framework import viewsets
#import model

# Create your views here.

class ModelView(viewsets.ModelViewSet):
    serializer_class = ModelNameSerializer
    #queryset = model.objects.all()
