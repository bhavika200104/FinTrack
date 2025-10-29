from .base import *

DEBUG = True
ALLOWED_HOSTS = ["*", "localhost", "127.0.0.1"]

INTERNAL_IPS = ["127.0.0.1"]

# Development CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # Only use this in development!
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
