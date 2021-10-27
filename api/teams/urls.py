from django.conf.urls import url
from django.urls import path
from . import views


app_name = 'teams'


urlpatterns = [
    path('', views.TeamListCreateView.as_view(), name='teams'),
    path('<uuid:pk>', views.TeamGetEditDeleteView.as_view(), name='teams_update'),
    path('<uuid:pk>/members', views.TeamMemberCreateView.as_view(), name='member_create'),
    path('<uuid:team_id>/members/<uuid:pk>', views.TeamMemberGetEditDeleteView.as_view(), name='member_update'),

]