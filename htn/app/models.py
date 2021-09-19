from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    # id field added automatically
    username = models.CharField(max_length=1000, unique=True)
    password = models.CharField(max_length=1000)

class RunHistory(models.Model):
    userid = models.ForeignKey(User, on_delete=models.CASCADE)
    time = models.DateTimeField()
    distance = models.IntegerField()
    pathid = models.AutoField(primary_key=True)

class SearchSettings(models.Model):
    userid = models.ForeignKey(User, on_delete=models.CASCADE)
    saved_lat = models.DecimalField(max_digits=100, decimal_places=7)
    saved_long = models.DecimalField(max_digits=100, decimal_places=7)
    distance = models.IntegerField()
    
class StartingLocs(models.Model):
    userid = models.ForeignKey(User, on_delete=models.CASCADE)
    start_lat = models.DecimalField(max_digits=100, decimal_places=7)
    start_long = models.DecimalField(max_digits=100, decimal_places=7)

class SavedPaths(models.Model):
    userid = models.ForeignKey(User, on_delete=models.CASCADE)
    pathpoints = models.TextField()

#model here