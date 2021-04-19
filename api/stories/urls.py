from django.conf.urls import url
from django.urls import path
from . import views


app_name = 'stories'


urlpatterns = [
    path('', views.StoryView.as_view(), name='create'),
    path('<uuid:id>', views.StoryDetailView.as_view(), name='detail'),
    path('comments', views.CommentCreateView.as_view(), name='comment_create'),
    path('comments/<uuid:pk>', views.CommentsView.as_view(), name='comments'),
    path('annotations', views.UserAnnoationsCreateView.as_view(), name='annotation_create'),
    path('annotations/<uuid:pk>/', views.UserAnnotationsView.as_view(), name='annotations')
]