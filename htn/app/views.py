from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login
from django.urls import reverse
from rest_framework.response import Response
from rest_framework.serializers import Serializer
from .models import User, RunHistory, SavedPaths
from .serializers import LoginSerializer, RegisterSerializer, RunHistorySerializer, SavedPathSerializer
from rest_framework import viewsets, generics, views
from .mapper import Mapper
from .pather import Pather
from rest_framework import serializers, status

# Create your views here.

class RunHistoryView(viewsets.ModelViewSet):
    serializer_class = RunHistorySerializer
    queryset = RunHistory.objects.all()

    def list(self, request):
        if request.user.is_anonymous:
            return Response([])
        self.queryset.filter(userid = request.user)
        serialized = RunHistorySerializer(self.queryset, many=True)
        return Response(serialized.data)

    def create(self, request):
        if request.user.is_anonymous:
            return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)
        print(request.data)
        return RunHistory.objects.create(request.data)

class SavedPathView(viewsets.ModelViewSet):
    serializer_class = SavedPathSerializer
    queryset = SavedPaths.objects.all()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class LoginView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = LoginSerializer

class MapView(views.APIView):
    def post(self, request):
        print(request.data)
        m = Mapper()
        mapperres = m.getMap((43.475926804284946, -80.53856707363026), 200)
        pather = Pather()
        res = pather.get_best_routes(mapperres["graph"],200)
        return Response(res)