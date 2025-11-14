from drf_spectacular.utils import extend_schema
from rest_framework.viewsets import ModelViewSet

from information.models import Action
from information.serializers.actions import ActionsSerializer

@extend_schema(tags=['Action'])
class ActionViewSet(ModelViewSet):
    serializer_class = ActionsSerializer
    queryset = Action.objects.all()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context