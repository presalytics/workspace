from rest_framework import serializers
from .models import BaseModel
import pytz


class BaseModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = BaseModel
        fields = ('id', 'created_at', 'updated_at', 'updated_by_id', 'created_by_id')
        abstract = True