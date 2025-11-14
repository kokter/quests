from django.urls import path, include
from rest_framework import routers

from service.viewsets.additions import AdditionsViewSet
from service.viewsets.service import ServiceViewSet, ServiceByUrlView
from service.viewsets.categories import CategoriesViewSet


router = routers.DefaultRouter()
router.register(r'addition', AdditionsViewSet, basename='addition')
router.register(r'service', ServiceViewSet)
router.register(r'category', CategoriesViewSet)


urlpatterns = [
    path('by-url/<str:url_name>/', ServiceByUrlView.as_view(), name='service-by-url'),
] + router.urls
