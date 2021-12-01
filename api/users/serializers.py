from rest_framework import serializers
from .models import UserMap, UserResource


class UserMapSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserMap
        fields = ('user_id','related_user_id','resource_id','resource_type','relationship_scope')


class UserResourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserResource
        fields = ('user_id', 'resource_id', 'resource_type')