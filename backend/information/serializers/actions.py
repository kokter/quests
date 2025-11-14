from rest_framework import serializers
from django.conf import settings

from information.models import Action


class ActionsSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    mobile_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Action
        fields = '__all__'
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f"{settings.MEDIA_URL}{obj.image.name}" if obj.image else None
        return None
    
    def get_mobile_image(self, obj):
        if obj.mobile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.mobile_image.url)
            return f"{settings.MEDIA_URL}{obj.mobile_image.name}" if obj.mobile_image else None
        return None