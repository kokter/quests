from rest_framework import serializers
from django.conf import settings

from service.models import Category

from service.serializers.service import ServiceSerializer


class CategorySerializer(serializers.ModelSerializer):
    icon = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = '__all__'
    
    def get_icon(self, obj):
        if obj.icon:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.icon.url)
            # Fallback если нет request в контексте
            return f"{settings.MEDIA_URL}{obj.icon.name}" if obj.icon else None
        return None

class CategoryRetrieveSerializer(serializers.ModelSerializer):
    icon = serializers.SerializerMethodField()
    services = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'services']
    
    def get_icon(self, obj):
        if obj.icon:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.icon.url)
            # Fallback если нет request в контексте
            return f"{settings.MEDIA_URL}{obj.icon.name}" if obj.icon else None
        return None
