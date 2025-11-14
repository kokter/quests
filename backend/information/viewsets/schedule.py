from django.apps import apps
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.viewsets import ModelViewSet

from information.models import Schedule
from information.serializers.schedule import ScheduleSerializer


@extend_schema(tags=["schedule"])
class ScheduleViewSet(ModelViewSet):
    serializer_class = ScheduleSerializer

    def get_queryset(self):
        self._release_expired_slots()

        qs = Schedule.objects.select_related("schedule_base", "schedule_base__service").all()
        service_id = self.request.query_params.get("service")
        service_url = self.request.query_params.get("service_url")

        if service_id:
            qs = qs.filter(schedule_base__service_id=service_id)
        if service_url:
            qs = qs.filter(schedule_base__service__url_name=service_url)

        return qs

    def _release_expired_slots(self):
        # Освобождаем истёкшие резервы на лету и отменяем связанные заказы
        now = timezone.now()
        expired = Schedule.objects.filter(reserved_until__isnull=False, reserved_until__lt=now)
        expired_ids = list(expired.values_list("id", flat=True))
        if not expired_ids:
            return

        Order = apps.get_model("order", "Order")
        Order.objects.filter(
            schedule_id__in=expired_ids,
            status=Order.Status.PENDING,
        ).update(status=Order.Status.CANCELLED)

        expired.update(reserved_until=None, is_active=True)
