from drf_spectacular.utils import extend_schema
from rest_framework.viewsets import ModelViewSet
from information.models import Schedule
from information.serializers.schedule import ScheduleSerializer


@extend_schema(tags=["schedule"])
class ScheduleViewSet(ModelViewSet):
    serializer_class = ScheduleSerializer
    queryset = Schedule.objects.all()