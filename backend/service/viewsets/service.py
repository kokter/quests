from drf_spectacular.utils import extend_schema
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from service.models import Service
from service.serializers.service import ServiceSerializer


@extend_schema(tags=['Service'])
class ServiceViewSet(ModelViewSet):
    serializer_class = ServiceSerializer
    queryset = Service.objects.all()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


@extend_schema(tags=['Service'])
class ServiceByUrlView(APIView):
    """
    Получить услугу по url_name
    """
    def get(self, request, url_name):
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Запрос услуги по url_name: {url_name}")
        
        # Логируем все услуги для отладки
        all_services = Service.objects.all()
        logger.info(f"Всего услуг в базе: {all_services.count()}")
        for s in all_services:
            logger.info(f"  - ID: {s.id}, Name: {s.name}, URL: '{s.url_name}'")
        
        try:
            service = Service.objects.get(url_name=url_name)
            logger.info(f"Услуга найдена: {service.name} (ID: {service.id})")
            serializer = ServiceSerializer(service, context={'request': request})
            return Response(serializer.data)
        except Service.DoesNotExist:
            from rest_framework import status
            logger.warning(f"Услуга с url_name='{url_name}' не найдена")
            return Response(
                {'error': f'Услуга с url_name="{url_name}" не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            from rest_framework import status
            logger.error(f"Ошибка при получении услуги по url_name={url_name}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Ошибка сервера: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


