from rest_framework import generics
from .permissions import OrganizationPermission
from .serializers import OrganizationSerializer


class OrganizationListCreateView(generics.ListCreateAPIView):
    permission_classes = (OrganizationPermission,)
    serializer_class = OrganizationSerializer


class OrganizationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (OrganizationPermission,)
    serializer_class = OrganizationSerializer
