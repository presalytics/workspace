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
    path('annotations/<uuid:pk>/', views.UserAnnotationsView.as_view(), name='annotations'),
    path('page/<uuid:pk>/thumbnail', views.ThumbnailView.as_view(), name='thumnail'),
    path('outline/<uuid:pk>', views.OutlineGetView.as_view(), name='outilne_detail'),
    path('outline/<uuid:pk>/patch', views.OutlinePatchCreateView.as_view(), name='outline_patch_create'),
    path('outline/<uuid:pk>/patch/<uuid:patch_id>', views.OutlinePatchGetView.as_view(), name='outline_patch_detail'),
    path('<uuid:story_id>/collaborators', views.CollaboratorsCreateListView.as_view(), name='collaborators_create'),
    path('<uuid:story_id>/collaborators/<uuid:collaborator_id>', views.CollaboratorsDetailView.as_view(), name='collaborators_detail'),
    path('permission_types', views.PermissionTypesListView.as_view(), name='permission_types')
]