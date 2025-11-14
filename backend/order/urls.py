from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets.order import OrderViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='orders')

urlpatterns = router.urls

