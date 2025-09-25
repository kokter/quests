from rest_framework import serializers

from information.models import Schedule


class ScheduleSerializer(serializers.Serializer):
    class Meta:
        model = Schedule
        fields = '__all__'