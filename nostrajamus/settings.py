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

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

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
    'api',

)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'nostrajamus.urls'

WSGI_APPLICATION = 'nostrajamus.wsgi.application'


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
else:
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        # 'NAME': 'nostrajamusdev',
        'NAME': 'nostrajamusdev2',
        'USER': 'django_login',
        'PASSWORD': 'django_login',
        'HOST': '',
        'PORT': '',
    }
    AWS_STORAGE_BUCKET_NAME = 'nostrajamus-dev'

REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
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
CELERY_TIMEZONE = 'UTC'
CELERY_IMPORTS = ('api.tasks',)
CELERYBEAT_SCHEDULE = {
    'update-playcounts': {
        'task': 'api.tasks.update_playcount',
        'schedule': timedelta(minutes=20)
    }
}

AUTH_USER_MODEL = 'api.Profile'

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

# S3
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
AWS_ACCESS_KEY_ID = 'AKIAIT6SLV63QQTHWCRQ'
AWS_SECRET_ACCESS_KEY = '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'
