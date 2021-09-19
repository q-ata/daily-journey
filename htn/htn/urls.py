"""htn URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from app import views

router = routers.DefaultRouter()
router.register(r'runhistory', views.RunHistoryView, 'runhistory_api')
router.register(r'savedpath', views.SavedPathView, 'savedpath_api')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/login', views.LoginView.as_view(), name="login_api"),
    path('api/register', views.RegisterView.as_view(), name="register_api"),
    path('api/map', views.MapView.as_view(), name="map_api"),
    path('api/badmap', views.BadMapView.as_view(), name="badmap_api"),
    path('api/gquery', views.GoogleMapView.as_view(), name="gquery_api")
]
