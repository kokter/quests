from drf_spectacular.utils import extend_schema
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from order.models.order import Order
from order.serializers.order import OrderSerializer


@extend_schema(tags=['Orders'])
class OrderViewSet(ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ["post", "options", "head"]

    def get_queryset(self):
        return Order.objects.select_related('service', 'schedule', 'schedule__schedule_base', 'schedule__schedule_base__service').prefetch_related('additions').all()

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [permission() for permission in self.permission_classes]

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        order = self.get_object()
        order.status = Order.Status.CONFIRMED
        order.save(update_fields=['status'])
        # Закрепляем слот окончательно
        schedule = order.schedule
        schedule.reserved_until = None
        schedule.is_active = False
        schedule.save(update_fields=['reserved_until', 'is_active'])
        return Response({'status': 'confirmed'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        order.status = Order.Status.CANCELLED
        order.save(update_fields=['status'])
        # Освобождаем слот, если резерв действовал
        schedule = order.schedule
        if schedule.reserved_until and schedule.reserved_until > timezone.now():
            schedule.reserved_until = None
            schedule.is_active = True
            schedule.save(update_fields=['reserved_until', 'is_active'])
        return Response({'status': 'cancelled'})
