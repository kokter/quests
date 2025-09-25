from drf_spectacular.utils import extend_schema
from rest_framework.viewsets import ModelViewSet

from information.models import ScheduleBase
from information.serializers.schedule_base import ScheduleBaseSerializer


@extend_schema(tags=["schedule_base"])
class ScheduleBaseViewSet(ModelViewSet):
    serializer_class = ScheduleBaseSerializer
    queryset = ScheduleBase.objects.all()