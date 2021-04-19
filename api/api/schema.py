import json
from rest_framework.schemas import SchemaGenerator


class SchemaMaker(SchemaGenerator):
    def get_schema(self, request, public):
        return super().get_schema(request=request, public=public)