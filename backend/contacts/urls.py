from django.urls import path, include
from rest_framework import routers

from contacts.viewsets import ContactViewSet

router = routers.DefaultRouter()
router.register(r'contact', ContactViewSet, basename='contact')

urlpatterns = router.urls

