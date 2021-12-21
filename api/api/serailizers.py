from rest_framework import serializers
from .models import BaseModel


class BaseModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = BaseModel
        fields = ('id', 'created_at', 'updated_at', 'updated_by_id', 'created_by_id')
        abstract = True

    def get_field_names(self, declared_fields, info):
        expanded_fields = super(BaseModelSerializer, self).get_field_names(declared_fields, info)

        if getattr(super(self.__class__, self).Meta, 'fields', None):
            expanded_fields += super(self.__class__, self).Meta.fields

        if getattr(self.Meta, 'fields', None):
            expanded_fields += self.Meta.fields

        return list(set(expanded_fields))
