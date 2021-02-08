from .base import *
import logging
from wsgi_microservice_middleware import RequestIdFilter, RequestIdJsonLogFormatter
LOG_LEVEL = logging.INFO

# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'workspace_api',
        'USER': 'workspace_bot',
        'PASSWORD': os.environ['DB_PASSWORD'],
        'HOST': os.environ['DB_HOST'],
        'PORT': 5432,
        'OPTIONS': {
            'sslmode': 'require' if env.bool('DB_REQUIRE_SSL', True)  else 'allow'
        }
    }
}

class LevelFilter(logging.Filter):
    def filter(self, record):
        return record.levelno > LOG_LEVEL


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
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
        'root': {
            'handlers': ['syslog'],
            'level': LOG_LEVEL,
            'propagate': True,
        },
    }
}

