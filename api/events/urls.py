from django.conf.urls import url
from django.urls import path
from . import views


app_name = 'events'


urlpatterns = [
    path('types', views.EventTypesListCreateView.as_view(), name='types'),
    path('types/<uuid:pk>', views.EventTypesRetrieveUpdateDestroyView.as_view(), name='types_update')
]