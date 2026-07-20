import logging

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import NotificationLog

logger = logging.getLogger(__name__)


def send_email(recipient, subject, body):
    """Send an email and record it in the NotificationLog.

    Works today with zero extra setup: EMAIL_BACKEND defaults to Django's
    console backend in development (prints to stdout) and SMTP in production,
    both configured in config/settings/base.py from environment variables.
    """
    log = NotificationLog.objects.create(
        channel=NotificationLog.Channel.EMAIL,
        recipient=recipient,
        subject=subject,
        body=body,
    )
    try:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [recipient])
    except Exception as exc:
        logger.exception('Failed to send email to %s', recipient)
        log.status = NotificationLog.Status.FAILED
        log.error = str(exc)
        log.save(update_fields=['status', 'error', 'updated_at'])
        raise
    log.status = NotificationLog.Status.SENT
    log.sent_at = timezone.now()
    log.save(update_fields=['status', 'sent_at', 'updated_at'])
    return log


def send_push_notification(device_token, title, body):
    """Send a push notification via Firebase Cloud Messaging.

    Not implemented yet: this project has no Firebase service-account
    credentials. To enable it:
      1. `pip install -r requirements/notifications.txt` (firebase-admin)
      2. Set FIREBASE_CREDENTIALS_PATH in .env to a service-account JSON file
      3. Initialize the Firebase Admin SDK (once, e.g. in this module) and
         call `firebase_admin.messaging.send(...)` here instead of raising.
    """
    NotificationLog.objects.create(
        channel=NotificationLog.Channel.PUSH,
        recipient=device_token,
        subject=title,
        body=body,
        status=NotificationLog.Status.FAILED,
        error='Firebase push is not configured yet.',
    )
    raise NotImplementedError('Firebase push notifications are not configured yet.')
