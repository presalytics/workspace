"""
Django settings for api project.

Generated by 'django-admin startproject' using Django 3.1.4.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/
"""

from pathlib import Path
from environs import Env
from urllib.parse import urlparse
from django.utils.module_loading import import_string
import os

env = Env()
env.read_env()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "debug-key")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool('DJANGO_DEBUG', False)

ALLOWED_HOSTS = [
    'localhost',
    'localhost:8000'
]

ALLOWED_HOSTS.extend(env.list("ALLOWED_HOSTS", []))

CSRF_TRUSTED_ORIGINS = ["localhost:8080", ".presalytics.io"]
CSRF_COOKIE_DOMAIN = '.presalytics.io'

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'user_sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # 'corsheaders',
    'rest_framework',
    'drf_spectacular',
    'django_extensions',
    'users',
    'conversations',
    'stories',
    'account',
    'organization',
    'events',
    'teams',
    'agent'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'user_sessions.middleware.SessionMiddleware',
    # 'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'users.middleware.PresalyticsAuthenticationMidddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'api.middleware.GlobalRequestMiddleware'
]

SESSION_SAVE_EVERY_REQUEST = True
SESSION_ENGINE = 'user_sessions.backends.db'
SESSION_COOKIE_SAMESITE = None
SESSION_COOKIE_NAME = 'presalytics.workspace'
LOGOUT_REDIRECT_URL = 'https://presalytics.io'

CORS_ALLOWED_ORIGINS = [
    os.environ['WORKSPACE_CLIENT_URL']
]
CORS_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
CORS_ALLOW_CREDENTIALS = True

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend'
]

ROOT_URLCONF = 'api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates')
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'api.wsgi.application'


# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/

STATIC_URL = '/static/'
# STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATICFILES_DIRS = [
    BASE_DIR / "static"
]

AUTH_USER_MODEL = 'users.PresalyticsUser'

SILENCED_SYSTEM_CHECKS = [
    'admin.E410'
]


REDIS_HOST = os.environ.get('REDIS_HOST', '127.0.0.1')
REDIS_PASS = os.environ['REDIS_PASSWORD']
REDIS_PORT = env.int('REDIS_PORT', 6379)
CLIENT_CREDENTIALS_CACHE_KEY = os.environ.get('CLIENT_CREDENTIALS_CACHE_KEY', 'debug-cache-key')


REDIS_URL = "redis://:{0}@{1}:{2}".format(REDIS_PASS, REDIS_HOST, REDIS_PORT)  # CELERYs

CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TASK_SERIALIZER = 'json'  # CACHE
CELERY_DEFAULT_QUEUE = 'workspace'
CELERY_DEFAULT_EXCHANGE = CELERY_DEFAULT_QUEUE

PRESALYTICS_SITE_URL = os.environ.get('PRESALYTICS_SITE_URL', 'https://presalytics.io/')
FRONTEND_BASE_URL = os.environ.get('WORKSPACE_CLIENT_URL', 'https://workspace.presalytics.io/')
USERS_URL = "{0}://{1}/".format(os.environ.get('USERS_PROTOCOL'), os.environ.get('USERS_HOST'))


REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
    ],
    'DEFAULT_RENDERER_CLASSES': (
        'djangorestframework_camel_case.render.CamelCaseJSONRenderer',
        'djangorestframework_camel_case.render.CamelCaseBrowsableAPIRenderer',
        # Any other renders
    ),
    'DEFAULT_PARSER_CLASSES': (
        # If you use MultiPartFormParser or FormParser, we also have a camel case version
        'djangorestframework_camel_case.parser.CamelCaseFormParser',
        'djangorestframework_camel_case.parser.CamelCaseMultiPartParser',
        'djangorestframework_camel_case.parser.CamelCaseJSONParser',
        # Any other parsers
    ),
    'JSON_UNDERSCOREIZE': {
        'no_underscore_before_number': True,
    },
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'api.exceptions.custom_exception_handler',
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'api.authentication.CsrfExemptSessionAuthentication',
        'rest_framework.authentication.BasicAuthentication'
    ]
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get('DB_NAME', 'workspace_api'),
        'USER': os.environ['DB_USER'],
        'PASSWORD': os.environ['DB_PASSWORD'],
        'HOST': os.environ['DB_HOST'],
        'PORT': 5432,
        'OPTIONS': {
            'sslmode': 'require' if env.bool('DB_REQUIRE_SSL', True) else 'allow'
        }
    },
}

AZURE_STORAGE_CONNECTION_STRING = env.str('AZURE_STORAGE_CONNECTION_STRING')
