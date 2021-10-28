from rest_framework import serializers
from .models import Account, AccountPlan, PlanFeatures
from api.serailizers import BaseModelSerializer


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields =  ('name', 'organization_id', 'account_admin_id') + BaseModelSerializer.Meta.fields


class AccountPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountPlan
        fields =  ('name', 'start_date', 'end_date', 'features_id', 'account_id') + BaseModelSerializer.Meta.fields


class PlanFeaturesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanFeatures
        fields =  ('name', 'max_stories_per_user', 'max_teams_per_plan', 'max_seats') + BaseModelSerializer.Meta.fields

