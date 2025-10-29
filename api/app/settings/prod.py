from .base import *

DEBUG = False

# Security Settings
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    # Add your domain here, e.g.:
    # "api.yourdomain.com",
    # "yourdomain.com",
]

# Production CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Local development
    "http://localhost",      # Production domain
    "http://127.0.0.1",     # Local IP
    # Add your frontend domain here, e.g.:
    # "https://yourdomain.com",
    # "https://www.yourdomain.com",
]

# If you're using HTTPS (recommended for production):
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

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

# Trust CSRF tokens from your frontend domain
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost",
    # Add your frontend domain here, e.g.:
    # "https://yourdomain.com",
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("POSTGRES_DB"),
        "USER": os.environ.get("POSTGRES_USER"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD"),
        "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),
    }
}
