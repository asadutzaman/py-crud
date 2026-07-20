from config.celery import app

from .services import send_email


@app.task
def send_email_task(recipient, subject, body):
    """Async wrapper around send_email — call with .delay(...) once a worker is running."""
    send_email(recipient, subject, body)
