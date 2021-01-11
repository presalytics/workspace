from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^login/?$', views.LoginView.as_view(), name='login'),
    url(r'^device-code/?$', views.DeviceCodeView.as_view(), name='device-code')
]