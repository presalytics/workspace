from .base import *
import logging
import sys
from wsgi_microservice_middleware import RequestIdFilter, RequestIdJsonLogFormatter
LOG_LEVEL = logging.INFO

# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases


class LevelFilter(logging.Filter):
    def filter(self, record):
        return record.levelno > LOG_LEVEL


ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", [])

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'request_id': {
            '()': RequestIdFilter
        },
        'level': {
            '()': LevelFilter
        }
    },
    'formatters': {
        'default': {
            'format': '%(asctime)s - %(threadName)s - %(name)s - %(levelname)s - %(message)s',
        },
        'json': {
            "()": RequestIdJsonLogFormatter
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
            'include_html': False
        },
        'wsgi': {
            'class': 'logging.StreamHandler',
            'formatter': 'default'

        },
        'syslog': {
            'level': 'INFO',
            'class': 'logging.handlers.SysLogHandler',
            'filters': ['request_id', 'level'],
            'formatter': 'json',
            'facility': 'local0',
            'address': '/dev/log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'stream': sys.stdout,
            'formatter': 'default'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True, 
        },
        'root': {
            'handlers': ['syslog'],
            'level': 'INFO',
            'propagate': True,
        },
        'django': {
            'level': 'INFO',
            'handlers': ['wsgi', 'syslog'],
        }
        
    }
}

