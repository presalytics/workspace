from django.conf.urls import url
from django.urls import path
from . import views


app_name = 'stories'


urlpatterns = [
    path('', views.StoryView.as_view(), name='create'),
    path('<uuid:pk>', views.StoryDetailView.as_view(), name='detail'),
    path('<uuid:pk>/render', views.RenderStoryView.as_view(), name='render'),
    path('comments', views.CommentCreateView.as_view(), name='comment_create'),
    path('comments/<uuid:pk>', views.CommentsView.as_view(), name='comments'),
    path('annotations', views.UserAnnoationsCreateView.as_view(), name='annotation_create'),
    path('annotations/<uuid:pk>/', views.UserAnnotationsView.as_view(), name='annotations'),
    path('outline/<uuid:pk>', views.OutlineGetView.as_view(), name='outilne_detail'),
    path('outline/<uuid:pk>/patch', views.OutlinePatchCreateView.as_view(), name='outline_patch_create'),
    path('outline/<uuid:pk>/patch/<uuid:patch_id>', views.OutlinePatchGetView.as_view(), name='outline_patch_detail'),
    path('<uuid:story_id>/collaborators', views.CollaboratorsCreateListView.as_view(), name='collaborators_create'),
    path('<uuid:story_id>/collaborators/<uuid:collaborator_id>', views.CollaboratorsDetailView.as_view(), name='collaborators_detail'),
    path('collaborators', views.CollaboratorsListAllView.as_view(), name='collaborators_all'),
    path('permission_types', views.PermissionTypesListView.as_view(), name='permission_types'),
    path('<uuid:pk>/collaborators/authorize/<uuid:user_id>/<str:permission>', views.StoryAuthorizationView.as_view(), name='story_authorization'),
]
