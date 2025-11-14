from drf_spectacular.utils import extend_schema
from rest_framework import mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from service.models import Category
from service.serializers.categories import CategorySerializer
from service.serializers.categories import CategoryRetrieveSerializer


@extend_schema(tags=['Category'])
class CategoriesViewSet(ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    
    def get_queryset(self):
        return Category.objects.filter(is_active=True)
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CategoryRetrieveSerializer
        return CategorySerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

