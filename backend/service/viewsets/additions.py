from drf_spectacular.utils import extend_schema
from rest_framework import mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from service.models import Addition
from service.serializers.additions import AdditionSerializer


@extend_schema(tags=['Addition'])
class AdditionsViewSet(ModelViewSet):
    serializer_class = AdditionSerializer
    queryset = Addition.objects.all()