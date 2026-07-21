from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.core.models import TimeStampedModel


class Role(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Menu(TimeStampedModel):
    key = models.SlugField(max_length=50, unique=True)
    label = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True)
    path = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.label


class RolePermission(TimeStampedModel):
    role = models.ForeignKey(Role, related_name='permissions', on_delete=models.CASCADE)
    menu = models.ForeignKey(Menu, related_name='role_permissions', on_delete=models.CASCADE)
    can_view = models.BooleanField(default=False)
    can_create = models.BooleanField(default=False)
    can_edit = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)

    class Meta:
        unique_together = ('role', 'menu')

    def __str__(self):
        return f'{self.role.name} / {self.menu.key}'


class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.ForeignKey(
        Role, related_name='users', on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return self.username
