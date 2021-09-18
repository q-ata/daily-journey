from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login
from django.urls import reverse
from .models import User, RunHistory, PathPoints
from .serializers import LoginSerializer, RegisterSerializer, RunHistorySerializer, PathPointsSerializer
from rest_framework import viewsets, generics

# Create your views here.

class RunHistoryView(viewsets.ModelViewSet):
    serializer_class = RunHistorySerializer
    queryset = RunHistory.objects.all()

class PathPointsView(viewsets.ModelViewSet):
    serializer_class = PathPointsSerializer
    queryset = PathPoints.objects.all()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class LoginView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = LoginSerializer