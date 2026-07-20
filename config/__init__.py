try:
    from .celery import app as celery_app

    __all__ = ('celery_app',)
except ImportError:
    # Celery isn't installed — install requirements/celery.txt to enable
    # background tasks (apps/notifications/tasks.py, etc).
    pass
