import logging
from rest_framework import generics
from .permissions import EventsPermission
from .serializers import EventTypesSerializer
logger = logging.getLogger(__name__)


class EventTypesListCreateView(generics.ListCreateAPIView):
    permission_classes = [EventsPermission]
    serializer_class = EventTypesSerializer


class EventTypesRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [EventsPermission]
    serializer_class = EventTypesSerializer
