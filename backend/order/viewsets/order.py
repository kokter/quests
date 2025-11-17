from datetime import timedelta
from ipaddress import ip_address as ip_parse, AddressValueError

from django.conf import settings
from django.db import models
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import Throttled
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from order.models import Order, ReservationAttempt
from order.serializers.order import OrderSerializer


@extend_schema(tags=['Orders'])
class OrderViewSet(ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ["post", "options", "head"]

    RATE_LIMIT_ATTEMPTS = getattr(settings, "ORDER_RATE_LIMIT_MAX_ATTEMPTS", 3)
    RATE_LIMIT_WINDOW_MINUTES = getattr(settings, "ORDER_RATE_LIMIT_WINDOW_MINUTES", 15)

    def get_queryset(self):
        return Order.objects.select_related('service', 'schedule', 'schedule__schedule_base', 'schedule__schedule_base__service').prefetch_related('additions').all()

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [permission() for permission in self.permission_classes]

    def create(self, request, *args, **kwargs):
        header_ip = self._get_client_ip(request)
        client_supplied_ip = self._normalize_ip(request.data.get("client_ip"))
        ip_address = client_supplied_ip or header_ip
        phone = self._normalize_phone(request.data.get("phone"))
        email = self._normalize_email(request.data.get("email"))

        self._enforce_rate_limit(ip_address, phone, email)
        if any([ip_address, phone, email]):
            ReservationAttempt.objects.create(
                ip_address=ip_address or None,
                phone=phone or "",
                email=email or "",
            )
        return super().create(request, *args, **kwargs)

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
        schedule.reserved_until = None
        schedule.is_active = True
        schedule.save(update_fields=['reserved_until', 'is_active'])
        return Response({'status': 'cancelled'})

    def _get_client_ip(self, request):
        client_header = request.META.get("HTTP_X_CLIENT_IP")
        if client_header:
            normalized = self._normalize_ip(client_header)
            if normalized:
                return normalized

        forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if forwarded:
            first_ip = forwarded.split(',')[0].strip()
            normalized = self._normalize_ip(first_ip)
            if normalized:
                return normalized
        remote_addr = request.META.get('REMOTE_ADDR', '').strip()
        return self._normalize_ip(remote_addr)

    def _enforce_rate_limit(self, ip_address, phone, email):
        identifiers = []
        if ip_address:
            identifiers.append(models.Q(ip_address=ip_address))
        if phone:
            identifiers.append(models.Q(phone=phone))
        if email:
            identifiers.append(models.Q(email=email))

        if not identifiers:
            return

        window_start = timezone.now() - timedelta(minutes=self.RATE_LIMIT_WINDOW_MINUTES)
        ReservationAttempt.objects.filter(created_at__lt=window_start).delete()
        query = models.Q(created_at__gte=window_start)
        combined_filter = query & (identifiers.pop())
        for extra in identifiers:
            combined_filter |= query & extra

        recent_attempts = ReservationAttempt.objects.filter(combined_filter).count()
        if recent_attempts >= self.RATE_LIMIT_ATTEMPTS:
            raise Throttled(
                detail={"detail": "Превышен лимит бронирований. Попробуйте позже."}
            )

    def _normalize_ip(self, value):
        if not value:
            return ""
        try:
            return str(ip_parse(value.strip()))
        except (AddressValueError, ValueError):
            return ""

    def _normalize_phone(self, value):
        if not value:
            return ""
        digits = "".join(filter(str.isdigit, str(value)))
        if digits.startswith("8") and len(digits) == 11:
            digits = "7" + digits[1:]
        if digits.startswith("+"):
            digits = digits[1:]
        return digits

    def _normalize_email(self, value):
        if not value:
            return ""
        return str(value).strip().lower()
