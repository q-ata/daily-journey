from rest_framework import serializers
from .models import RunHistory, PathPoints

#class modelNameSerializer
class RunHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RunHistory
        fields = ('userid', 'time', 'distance', 'pathid')

class PathPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PathPoints
        fields = ('pathid', 'listid', 'point_lat', 'point_long')

