from django.conf.urls import url
from django.urls import path
from django.contrib.auth.decorators import login_required
from . import views


app_name = 'users'


urlpatterns = [
    path('session/', views.SessionView.as_view(), name='session'),
    path('relationships/', login_required(views.UserRelationshipView.as_view()), name='relationships'),
    path('user-info/<uuid:id>/', login_required(views.UserInfoView.as_view()), name='info'),
    path('resources/<uuid:id>/', views.ResourcesView.as_view(), name='resources'), # get resources as list of ids + resourceTypes, required CC Token
    path('related/searach', views.RelatedUserView.as_view(), name='related') # get relatted users of the requested user in query string, requres CC Token
]