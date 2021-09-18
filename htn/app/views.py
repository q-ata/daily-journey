from django.shortcuts import render
from .models import RunHistory, PathPoints
from .serializers import RunHistorySerializer, PathPointsSerializer
from rest_framework import viewsets
#import model

# Create your views here.

class RunHistoryView(viewsets.ModelViewSet):
    serializer_class = RunHistorySerializer
    queryset = RunHistory.objects.all()

class PathPointsView(viewsets.ModelViewSet):
    serializer_class = PathPointsSerializer
    queryset = PathPoints.objects.all()
