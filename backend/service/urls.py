from django.urls import path, include
from rest_framework import routers

from service.viewsets.additions import AdditionsViewSet
from service.viewsets.service import ServiceViewSet
from service.viewsets.categories import CategoriesViewSet


router = routers.DefaultRouter()
router.register(r'addition', AdditionsViewSet)
router.register(r'service', ServiceViewSet)
router.register(r'category', CategoriesViewSet)


urlpatterns = router.urls