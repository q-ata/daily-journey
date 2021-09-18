from django.db import models

# Create your models here.
class Users(models.Model):
    # id field added automatically
    username = models.CharField(max_length=1000)
    password = models.CharField(max_length=1000)

class RunHistory:
    userid = models.ForeignKey(Users, on_delete=models.CASCADE)
    time = models.DateTimeField()
    distance = models.IntegerField()
    pathid = models.BigAutoField()

class SearchSettings:
    userid = models.ForeignKey(Users, on_delete=models.CASCADE)
    saved_lat = models.DecimalField()
    saved_long = models.DecimalField()
    distance = models.IntegerField()
    
class StartingLocs:
    userid = models.ForeignKey(Users, on_delete=models.CASCADE)
    start_lat = models.DecimalField()
    start_long = models.DecimalField()

class SavedPaths:
    userid = models.ForeignKey(Users, on_delete=models.CASCADE)
    pathid = models.IntegerField()

class PathPoints:
    pathid = models.IntegerField()
    listid = models.IntegerField()
    point_lat = models.DecimalField()
    point_long = models.DecimalField()

#model here