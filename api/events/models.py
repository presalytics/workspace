from django.db import models
from api.models import BaseModel


class SourceChoices(models.TextChoices):
    OOXML_AUTOMATION = 'ooxml_automation'
    DOC_CONVERTER = 'doc_converter'
    WORKSPACE = 'workpsace'
    FRONTEND = 'frontend_app'


class EventTypes(BaseModel):
    display_name = models.CharField(max_length=1028, null=False)
    type_name = models.CharField(max_length=1028, null=False)
    description = models.TextField(max_length=2048)
    source = models.CharField(max_length=512, choices=SourceChoices.choices)
    default_formatter = models.TextField(max_length=4096)
