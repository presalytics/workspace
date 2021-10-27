from django.conf.urls import url
from django.urls import path
from . import views


app_name = 'organziation'


urlpatterns = [
    path('', views.OrganizationListCreateView.as_view(), name='organization'),
    path('<uuid:pk>', views.OrganizationRetrieveUpdateDestroyView.as_view(), name='organization_update')
]