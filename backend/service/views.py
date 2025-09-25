# views.py
from django.http import JsonResponse
from django.views import View

from information.models import Schedule
from service.models import Addition


class CalculateOrderPriceView(View):
    def get(self, request):
        schedule_id = request.GET.get("schedule_id")
        additions_ids = request.GET.getlist("additions[]")

        total = 0
        if schedule_id:
            schedule = Schedule.objects.get(id=schedule_id)
            total += schedule.price

        if additions_ids:
            additions = Addition.objects.filter(id__in=additions_ids)
            total += sum(a.cost for a in additions)

        return JsonResponse({"total_cost": float(total)})
