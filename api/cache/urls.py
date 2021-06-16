from django.conf.urls import url
from django.urls import path
from . import views


app_name = 'cache'


urlpatterns = [
    path('<uuid:nonce>', views.NonceCacheView.as_view(), name='cache'),
]