from rest_framework import serializers
from django.conf import settings

from service.models import Service

class ServiceSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = '__all__'
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            # Fallback если нет request в контексте
            return f"{settings.MEDIA_URL}{obj.image.name}" if obj.image else None
        return None