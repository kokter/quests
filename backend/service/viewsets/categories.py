from drf_spectacular.utils import extend_schema
from rest_framework import mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from service.models import Category
from service.serializers.categories import CategorySerializer


@extend_schema(tags=['Category'])
class CategoriesViewSet(ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

