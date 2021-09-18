from rest_framework import serializers
from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.response import Response
from .models import User, RunHistory, PathPoints

#class modelNameSerializer
class RunHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RunHistory
        fields = ('userid', 'time', 'distance', 'pathid')

class PathPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PathPoints
        fields = ('pathid', 'listid', 'point_lat', 'point_long')

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=1000)
    password = serializers.CharField(max_length=1000)

    def validate(self, data):
        username = data.get("username", None)
        password = data.get("password", None)
        return {
            'username': username,
            'password': password
        }

    def create(self, validated_data):
        user = authenticate(username=validated_data['username'], password=validated_data['password'])
        if user is not None:
            login(self.context['request'], user)
            return Response("Valid login", status=status.HTTP_200_OK)

        else:
            return Response("Invalid login", status=status.HTTP_400_BAD_REQUEST)


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=('username', 'password')

    def create(self, validated_data):
        user = User.objects.create(username=validated_data['username'])
        user.set_password(validated_data['password'])
        user.save()

        return Response(user, status=status.HTTP_201_CREATED)

