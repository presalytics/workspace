from django.db import models
from api.models import BaseModel
from users.models import PresalyticsUser
# Create your models here.

class Organization(BaseModel):
    name = models.CharField(max_length=256)
    

