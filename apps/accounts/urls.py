from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('users', views.UserViewSet, basename='user')
router.register('roles', views.RoleViewSet, basename='role')
router.register('menus', views.MenuViewSet, basename='menu')

urlpatterns = router.urls + [
    path('auth/me/', views.MeView.as_view(), name='me'),
]
