from django.conf.urls import url
from django.urls import path
from django.contrib.auth.decorators import login_required
from . import views


app_name = 'users'


urlpatterns = [
    path('audience/', views.UserRelationshipView.as_view(), name='audience'),
    path('resources/', views.UserResourcesView.as_view(), name='user_resources'),
    path('user-info/<uuid:id>/', views.UserInfoView.as_view(), name='info'),
    path('resources/<uuid:id>/', views.ResourcesView.as_view(), name='resources'), # get resources as list of ids + resourceTypes, required CC Token
    path('related/search', views.RelatedUserView.as_view(), name='related_search') # get relatted users of the requested user in query string, requres CC Token
]