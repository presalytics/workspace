from django.db.models.base import Model
from rest_framework.serializers import ModelSerializer
from api.serailizers import BaseModelSerializer
from .models import EventTypes


class EventTypesSerializer(ModelSerializer):
    class Meta:
        model = EventTypes
        fields =  ('display_name', 'type_name', 'description', 'source', 'default_formatter') + BaseModelSerializer.Meta.fields