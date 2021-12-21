from django.conf.urls import url
from django.urls import path
from . import views


app_name = 'conversations'


urlpatterns = [
    path('', views.ConversationsView.as_view(), name='list'),
    path('<uuid:id>', views.ConversationsDetailView.as_view(), name='detail'),
    path('<uuid:id>/messages', views.MessagesCreateView.as_view(), name='messages'),
    path('<uuid:id>/participants', views.ParticipantsCreateListView.as_view(), name='participant_create'),
    path('<uuid:id>/participants/<uuid:participant_id>', views.ParticipantsRemoveView.as_view(), name='participant_remove'),
    path('user/<uuid:api_user_id>', views.UserConversationsView.as_view(), name='user_conversations')
]
