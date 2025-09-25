from rest_framework import serializers

from information.models import Action


class ActionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Action
        fields = '__all__'