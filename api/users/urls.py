from django.conf.urls import url
from . import views


app_name = 'users'


urlpatterns = [
    url(r'^session/?$', views.SessionView.as_view(), name='session'),
]