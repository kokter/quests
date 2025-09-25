from django.contrib import admin, messages
from django.urls import path
from django.shortcuts import redirect, render
from datetime import timedelta

from information.forms import MultiWeekScheduleGenerationForm
from information.models import ScheduleBase, Schedule


def generate_schedule(self, request):
    if request.method == 'POST':
        form = MultiWeekScheduleGenerationForm(request.POST)
        if form.is_valid():
            start_date = form.cleaned_data['start_date']
            weeks_count = form.cleaned_data['weeks_count']
            created_count = 0
            updated_count = 0

            schedule_bases = ScheduleBase.objects.all()
            for week in range(weeks_count):
                week_start = start_date + timedelta(weeks=week)
                for base in schedule_bases:
                    for day_number in base.days:
                        day_offset = (day_number - 1)
                        schedule_date = week_start + timedelta(days=day_offset)

                        for time_field, price in zip(base.times, base.prices):
                            schedule_obj, created = Schedule.objects.get_or_create(
                                schedule_base=base,
                                date=schedule_date,
                                time=time_field,
                                defaults={'price': price}
                            )
                            if created:
                                created_count += 1
                            else:
                                if schedule_obj.price != price:
                                    schedule_obj.price = price
                                    schedule_obj.save(update_fields=['price'])
                                    updated_count += 1

            self.message_user(
                request,
                f"Генерация завершена: {created_count} новых слотов, {updated_count} обновлено.",
                level=messages.SUCCESS
            )
            return redirect("..")
    else:
        form = MultiWeekScheduleGenerationForm()

    context = dict(
        self.admin_site.each_context(request),
        form=form
    )
    return render(request, "admin/generate_schedule.html", context)
