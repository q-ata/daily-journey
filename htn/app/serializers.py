from rest_framework import serializers
from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.response import Response
from .models import User, RunHistory, PathPoints
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated

#class modelNameSerializer
class RunHistorySerializer(serializers.ModelSerializer):
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]

    class Meta:
        model = RunHistory
        fields = ('userid', 'time', 'distance', 'pathid')

    def list(self, request):
        content = {
            "user": str(request.user),
            "auth": str(request.auth),
        }
        return Response(content)

class PathPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PathPoints
        fields = ('pathid', 'listid', 'point_lat', 'point_long')

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=1000)
    password = serializers.CharField(max_length=1000)

    def validate(self, data):
        print(data)
        username = data.get("username", None)
        password = data.get("password", None)
        user = authenticate(username=username, password=password)
        if user is None:
            raise serializers.ValidationError("Invalid login")

        return {
            'username': username,
            'password': password
        }

    def create(self, validated_data):
        user = authenticate(username=validated_data['username'], password=validated_data['password'])
        login(self.context.get("request"), user)
        return user


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=('username', 'password')

    def create(self, validated_data):
        user = User.objects.create(username=validated_data['username'])
        user.set_password(validated_data['password'])
        user.save()

        return user

