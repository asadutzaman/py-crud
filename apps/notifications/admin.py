from django.contrib import admin

from .models import NotificationLog


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ['channel', 'recipient', 'subject', 'status', 'created_at']
    list_filter = ['channel', 'status']
    search_fields = ['recipient', 'subject']
    readonly_fields = ['created_at', 'updated_at']
