import logging
import sys
from wsgi_microservice_middleware import RequestIdFilter
from .base import *

# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases
LOG_LEVEL = logging.INFO

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            'format': '%(asctime)s - %(threadName)s - %(name)s - %(levelname)s - %(message)s',
        },
    },
    'handlers': {
        'wsgi': {
            'class': 'logging.StreamHandler',
            'formatter': 'default'

        },
        'syslog': {
            'level': LOG_LEVEL,
            'class': 'logging.handlers.SysLogHandler',
            'formatter': 'default',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'stream': sys.stdout,
            'formatter': 'default'
        }
    },
    'loggers': {
        'root': {
            'handlers': ['syslog'],
            'level': LOG_LEVEL,
            'propagate': True, 
        },
        'django': {
            'level': LOG_LEVEL,
            'handlers': ['wsgi', 'syslog'],
            'propagate': True,
        }  
    }
}
