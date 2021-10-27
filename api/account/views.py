from django.views import generic
from rest_framework import generics
from api.permissions import PresalyticsInternalPermssion
from .serializers import AccountSerializer, AccountPlanSerializer, PlanFeaturesSerializer

# Create your views here.

class AccountListCreateView(generics.ListCreateAPIView):
    permission_classes = (PresalyticsInternalPermssion,)
    serializer_class = AccountSerializer


class AccountGetEditDeleteView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (PresalyticsInternalPermssion,)
    serializer_class = AccountSerializer


class AccountPlanListCreateView(generics.ListCreateAPIView):
    permission_classes = (PresalyticsInternalPermssion,)
    serializer_class = AccountPlanSerializer


class AccountPlanGetEditDeleteView(generics.ListCreateAPIView):
    permission_classes = (PresalyticsInternalPermssion,)
    serializer_class = AccountPlanSerializer


class FeaturesListCreateView(generics.ListCreateAPIView):
    permission_classes = (PresalyticsInternalPermssion,)
    serializer_class = PlanFeaturesSerializer


class FeaturesGetEditDeleteView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (PresalyticsInternalPermssion,)
    serializer_class = PlanFeaturesSerializer