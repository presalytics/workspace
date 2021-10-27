from rest_framework.serializers import ModelSerializer
from api.serailizers import BaseModelSerializer
from .models import Team, TeamMember


class TeamMemberSerializer(ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ('team_id', 'user_id', 'role') + BaseModelSerializer.Meta.fields


class TeamSerializer(ModelSerializer):
    members = TeamMemberSerializer(many=True)

    class Meta:
        model = Team
        fields =  ('members', 'team_type', 'organization_id', 'name', 'description') + BaseModelSerializer.Meta.fields