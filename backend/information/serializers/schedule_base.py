from rest_framework import serializers

from information.models import ScheduleBase


class ScheduleBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleBase
        fields = '__all__'