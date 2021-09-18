from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login
from django.urls import reverse
from rest_framework.response import Response
from .models import User, RunHistory
from .serializers import LoginSerializer, RegisterSerializer, RunHistorySerializer, MapSerializer
from rest_framework import viewsets, generics
from .mapper import Mapper
import json

# Create your views here.

class RunHistoryView(viewsets.ModelViewSet):
    serializer_class = RunHistorySerializer
    queryset = RunHistory.objects.all()

    def list(self, request):
        print(request)
        content = {
            "user": str(request.user),
            "auth": str(request.auth),
        }
        return Response(content)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class LoginView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = LoginSerializer

class MapView(generics.CreateAPIView):
    def post(self, request):
        m = Mapper()
        res = m.getMap()
        return Response(res)