from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets.actions import ActionViewSet
from .viewsets.schedule import ScheduleViewSet
from .viewsets.schedule_base import ScheduleBaseViewSet

router = DefaultRouter()
router.register(r'actions', ActionViewSet, basename='action')
router.register(r'schedule', ScheduleViewSet, basename='schedule')
router.register(r'schedule_base', ScheduleBaseViewSet, basename='schedule_base')

urlpatterns = router.urls

