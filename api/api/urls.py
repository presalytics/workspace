"""presalytics_workspace URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
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
from django.urls import path
from django.conf.urls import url, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularJSONAPIView, SpectacularSwaggerView
from .views import home

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),
    url(r'^user/', include('users.urls', namespace='users')),
    url(r'', include('user_sessions.urls', 'user_sessions')),
    url(r'^conversations/', include('conversations.urls', namespace='conversations')),
    url(r'^stories/', include('stories.urls', namespace='stories')),
    url(r'^organizations/', include('organization.urls', namespace='organization')),
    url(r'^events/', include('events.urls', namespace='events')),
    url(r'^teams/', include('teams.urls', namespace='teams')),
    url(r'^accounts/', include('account.urls', namespace='account')),
    url(r'^cache/', include('cache.urls', namespace='cache')),
    path('openapi/schema.json', SpectacularJSONAPIView.as_view(), name='schema'),
    path('openapi', SpectacularSwaggerView.as_view(), name='schema_ui')
]
