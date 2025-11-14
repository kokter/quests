from rest_framework import serializers
from django.utils import timezone

from information.models import Schedule


class ScheduleSerializer(serializers.ModelSerializer):
    # Переопределяем вывод доступности с учётом резерва
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = '__all__'

    def get_is_active(self, obj):
        # Если есть активный резерв до будущего времени — недоступно
        if obj.reserved_until and obj.reserved_until > timezone.now():
            return False
        return bool(obj.is_active)
