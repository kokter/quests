from drf_spectacular.utils import extend_schema
from rest_framework.viewsets import ModelViewSet

from service.models import Addition
from service.serializers.additions import AdditionSerializer


@extend_schema(tags=['Addition'])
class AdditionsViewSet(ModelViewSet):
    serializer_class = AdditionSerializer

    def get_queryset(self):
        qs = Addition.objects.select_related("category").all()
        category_id = self.request.query_params.get("category")
        service_url = self.request.query_params.get("service_url")

        if category_id:
            qs = qs.filter(category_id=category_id)
        if service_url:
            # Найти дополнения по категории услуги, определённой url_name
            qs = qs.filter(category__services__url_name=service_url).distinct()

        return qs
