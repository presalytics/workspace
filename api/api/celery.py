import os
import celery
from api.middleware import get_request, RequestNotFound
from celery.signals import before_task_publish, task_prerun
from django.conf import settings



# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')

app = celery.Celery('workspace')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()


@before_task_publish.connect
def receiver_before_task_publish(sender=None, headers=None, body=None, **kwargs):
    metadata = {}
    try:
        metadata["user_id"] = get_request().user.id
    except (KeyError, AttributeError, RequestNotFound):
        metadata["user_id"] = None
    headers['__metadata__'] = metadata

@task_prerun.connect
def receiver_task_pre_run(task_id, task, *args, **kwargs):
    metadata = getattr(task.request, '__metadata__', {})
    if metadata.get("user_id", None):
        kwargs["user"] = settings.AUTH_USER_MODEL.objects.get(pk=metadata["user_id"])
    else:
        kwargs["user"] = None



