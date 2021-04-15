from django.conf.urls import url
from django.urls import path
from django.contrib.auth.decorators import login_required
from . import views


app_name = 'users'


urlpatterns = [
    path('session/', views.SessionView.as_view(), name='session'),
    path('relationships/', login_required(views.UserRelationshipView.as_view()), name='relationships'),
    path('user-info/<uuid:id>/', login_required(views.UserInfoView.as_view()), name='info')
]