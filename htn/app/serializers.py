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

class LoginSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=('username', 'password')

    def validate(self, data):
        username = data.get("username", None)
        password = data.get("password", None)
        user = authenticate(username=username, password=password)
        if user is not None:
            login(self.context['request'], user)

        else:
            raise serializers.ValidationError(
                'Invalid login'
            )

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=('username', 'password')

    def create(self, validated_data):
        user = User.objects.create(username=validated_data['username'])
        user.set_password(validated_data['password'])
        user.save()

        return Response(user, status=status.HTTP_201_CREATED)

