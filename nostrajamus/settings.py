"""
Django settings for nostrajamus project.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

from datetime import timedelta

import djcelery
djcelery.setup_loader()
BROKER_URL = 'django://'
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.7/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'dqc5qtm6h6$u853(jf@%^!-qe(e==-=0b9njzo(g)6o8a))l)z'

# SECURITY WARNING: don't run with debug turned on in production

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'djcelery',
    'storages',
    'kombu.transport.django',
    'rest_framework',
    'rest_framework_swagger',
    'haystack',
    'referral',
    'api',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'referral.middleware.ReferrerMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'nostrajamus.urls'

WSGI_APPLICATION = 'nostrajamus.wsgi.application'

# S3
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
AWS_ACCESS_KEY_ID = 'AKIAIT6SLV63QQTHWCRQ'
AWS_SECRET_ACCESS_KEY = '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'
os.environ.setdefault("AWS_ACCESS_KEY_ID", AWS_ACCESS_KEY_ID)
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", AWS_SECRET_ACCESS_KEY)
BROKER_BACKEND = "SQS"

# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases

DATABASES = {}

instance_id = os.environ.get('INSTANCE_ID', None)
if instance_id == 'PROD':
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'NostrajamusProd',
        'USER': os.environ['RDS_USERNAME'],
        'PASSWORD': os.environ['RDS_PASSWORD'],
        'HOST': 'nostrajamusprod.cqgo2wxdycyf.us-east-1.rds.amazonaws.com',
        'PORT': os.environ['RDS_PORT']
    }
    AWS_STORAGE_BUCKET_NAME = 'nostrajamus-prod'
    BROKER_URL = 'sqs://sqs.us-east-1.amazonaws.com/755639026061/nostrajamus-prod'
    DEBUG = False
    ALLOWED_HOSTS = ['*', 'nostrajamus.com']
    # CELERY_DEFAULT_QUEUE = 'nostrajamus-prod'
else:
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        # 'NAME': 'nostrajamusdev',
        'NAME': 'NostrajamusProd',
        'USER': 'nostrajamus',
        'PASSWORD': 'Nostra123',
        'HOST': 'nostrajamusprodreadreplica.cqgo2wxdycyf.us-east-1.rds.amazonaws.com',
        'PORT': '5432',
    }
    AWS_STORAGE_BUCKET_NAME = 'nostrajamus-dev'
    BROKER_URL = 'sqs://sqs.us-east-1.amazonaws.com/755639026061/nostrajamus-dev'
    DEBUG = True
    # CELERY_DEFAULT_QUEUE = 'nostrajamus-dev'

REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FileUploadParser'
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),
    'PAGINATE_BY': 10
}

# Celery
CELERYBEAT_SCHEDULER = 'djcelery.schedulers.DatabaseScheduler'
CELERY_TIMEZONE = 'US/Eastern'
CELERY_IMPORTS = ('api.tasks',)
CELERYBEAT_SCHEDULE = {
    'update-playcounts': {
        'task': 'api.tasks.update_playcount',
        'schedule': timedelta(minutes=30)
    },
    'update-player-jampoints': {
        'task': 'api.tasks.update_user_jam_points',
        'schedule': timedelta(minutes=30)
    },
    'update-daily-rankings': {
        'task': 'api.tasks.update_daily_rankings',
        'schedule': timedelta(minutes=60)
    },
    'update-weekly-rankings': {
        'task': 'api.tasks.update_weekly_rankings',
        'schedule': timedelta(minutes=60)
    },
    'update-monthly-rankings': {
        'task': 'api.tasks.update_monthly_rankings',
        'schedule': timedelta(minutes=60)
    },
    'update-alltime-rankings': {
        'task': 'api.tasks.update_all_time_rankings',
        'schedule': timedelta(minutes=60)
    }
}

AUTH_USER_MODEL = 'api.Profile'

# Whoosh
HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'haystack.backends.whoosh_backend.WhooshEngine',
        'PATH': os.path.join(os.path.dirname(__file__), 'whoosh_index'),
    },
}

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/

STATIC_URL = '/assets/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, "angular/assets"),
    os.path.join(BASE_DIR, "angular/templates/admin2/angularjs"),
)
# print STATIC_ROOT

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#    'django.template.loaders.eggs.Loader',
)
TEMPLATE_DIRS = (os.path.join(BASE_DIR, 'angular/templates/admin2/angularjs'),)

EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'nostrajamus.music@gmail.com'
EMAIL_HOST_PASSWORD = 'Nostra123'
EMAIL_PORT = 587
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
