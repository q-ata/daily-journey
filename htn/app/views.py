from rest_framework.response import Response
from rest_framework.serializers import Serializer
from .models import User, RunHistory, SavedPaths
from .serializers import LoginSerializer, RegisterSerializer, RunHistorySerializer, SavedPathSerializer
from rest_framework import viewsets, generics, views
from .mapper import Mapper
from .pather import Pather
from rest_framework import serializers, status
import requests
import json
from decimal import Decimal


f = open("/root/hack-the-north/htn/app/key.json")

jdata = json.load(f)

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
            return Response("Invalid login", status=status.HTTP_400_BAD_REQUEST)
        
        newdata = {
            "userid": request.user.id,
            "time": request.data["time"],
            "distance": request.data["distance"]
        }
        serializer = self.get_serializer(data=newdata)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK, headers=headers)

class SavedPathView(viewsets.ModelViewSet):
    serializer_class = SavedPathSerializer
    queryset = SavedPaths.objects.all()

    def list(self, request):
        if request.user.is_anonymous:
            return Response([])
        #self.queryset.filter(userid = request.user)
        serialized = SavedPathSerializer(self.queryset, many=True)
        return Response(serialized.data)

    def create(self, request):
        if request.user.is_anonymous:
            return Response("Invalid login", status=status.HTTP_400_BAD_REQUEST)
        
        newdata = {
            "userid": request.user.id,
            "pathpoints": request.data["pathpoints"]
        }
        serializer = self.get_serializer(data=newdata)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK, headers=headers)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class LoginView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = LoginSerializer

class MapView(views.APIView):
    def get(self, request):
        if request.user.is_anonymous:
            return Response("Invalid login", status=status.HTTP_400_BAD_REQUEST)

        if not "center" in request.query_params:
            return Response("Missing center", status=status.HTTP_400_BAD_REQUEST)

        if not "distance" in request.query_params:
            return Response("Missing distance", status=status.HTTP_400_BAD_REQUEST)
        
        m = Mapper()
        string = request.query_params["center"]
        splitArr = string.split(",")
        center = [float(splitArr[0]), float(splitArr[1])]
        distance = int(request.query_params["distance"])

        mapperres = m.getMap(center, distance)
        pather = Pather()
        res = pather.get_best_routes(mapperres["graph"],distance)
        return Response(res)

class GoogleMapView(views.APIView):
    def get(self, request):
        if request.user.is_anonymous:
            return Response("Invalid login", status=status.HTTP_400_BAD_REQUEST)

        if not "place_id" in request.query_params:
            return Response("Missing place_id", status=status.HTTP_400_BAD_REQUEST)

        r = requests.get("https://maps.googleapis.com/maps/api/place/details/json?place_id="+request.query_params["place_id"]+"&key="+jdata["key"])
        data = r.json()
        return Response(data) 