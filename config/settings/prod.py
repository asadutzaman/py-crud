import os

from .base import *  # noqa: F401,F403

DEBUG = False

if SECRET_KEY.startswith('django-insecure-'):  # noqa: F405
    raise RuntimeError('Set a real SECRET_KEY environment variable in production.')

_allowed_hosts = os.environ.get('ALLOWED_HOSTS', '')
ALLOWED_HOSTS = [h.strip() for h in _allowed_hosts.split(',') if h.strip()]
if not ALLOWED_HOSTS:
    raise RuntimeError('Set the ALLOWED_HOSTS environment variable (comma-separated) in production.')

# Assumes a TLS-terminating proxy in front of the app (nginx, a load balancer, etc).
SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'True') == 'True'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 7
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
