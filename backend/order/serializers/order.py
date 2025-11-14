from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from order.models.order import Order


class OrderSerializer(serializers.ModelSerializer):
    additions = serializers.PrimaryKeyRelatedField(many=True, required=False, queryset=Order.additions.rel.model.objects.all())

    class Meta:
        model = Order
        fields = ['id', 'service', 'additions', 'schedule', 'total_cost', 'name', 'email', 'phone', 'comment', 'admin_comment', 'status', 'created_at']
        read_only_fields = ['id', 'service', 'total_cost', 'status', 'created_at']

    def validate(self, attrs):
        schedule = attrs.get('schedule')
        if schedule is None:
            raise serializers.ValidationError({'schedule': 'Обязательное поле'})
        # Проверка доступности слота
        if not schedule.is_active:
            # Если слот неактивен, возможно резерв
            if schedule.reserved_until and schedule.reserved_until <= timezone.now():
                pass
            else:
                raise serializers.ValidationError({'schedule': 'Выбранное время недоступно'})
        return attrs

    def create(self, validated_data):
        additions = validated_data.pop('additions', [])
        schedule = validated_data['schedule']

        with transaction.atomic():
            schedule = schedule.__class__.objects.select_for_update().select_related(
                "schedule_base__service"
            ).get(pk=schedule.pk)
            now = timezone.now()

            if not schedule.is_active and not (schedule.reserved_until and schedule.reserved_until <= now):
                raise serializers.ValidationError({'schedule': 'Выбранное время недоступно'})

            service = schedule.schedule_base.service
            order = Order.objects.create(service=service, **validated_data)
            if additions:
                order.additions.set(additions)

            schedule.reserved_until = now + timedelta(minutes=15)
            schedule.is_active = False
            schedule.save(update_fields=['reserved_until', 'is_active'])

            order.save()
            return order
