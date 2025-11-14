from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from contacts.models import Contact
from contacts.serializers import ContactSerializer


@extend_schema(tags=['Contact'])
class ContactViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet для получения контактной информации.
    Возвращает единственную запись контактов.
    """
    serializer_class = ContactSerializer
    queryset = Contact.objects.all()

    def list(self, request, *args, **kwargs):
        """Возвращает единственную запись контактов"""
        contact = Contact.objects.first()
        if contact:
            serializer = self.get_serializer(contact)
            return Response(serializer.data)
        return Response({})

