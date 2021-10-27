from rest_framework import serializers
from .models import Organization
from api.serailizers import BaseModelSerializer

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields =  ('name',) + BaseModelSerializer.Meta.fields