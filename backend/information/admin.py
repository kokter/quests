from django.contrib import admin
from django.apps import apps
from .forms import MultiWeekScheduleGenerationForm, ScheduleBaseAdminForm
from .models import ScheduleBase, Schedule
from django.urls import path
from django.contrib import messages
from django.contrib import admin
from .models import Schedule
from itertools import groupby
from operator import attrgetter
from django.shortcuts import get_object_or_404, render, redirect
from django.http import JsonResponse
from django.template.response import TemplateResponse
from information.management.commands.generate_schedule import generate_schedule_for_period

# 1️⃣ Кастомный ModelAdmin для ScheduleBase с кнопкой генерации
@admin.register(ScheduleBase)
class ScheduleBaseAdmin(admin.ModelAdmin):
    form = ScheduleBaseAdminForm
    list_display = ("service",)
    change_list_template = "admin/schedulebase_changelist.html"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'generate_schedule/',
                self.admin_site.admin_view(self.generate_schedule),
                name='generate_schedule'
            ),
        ]
        return custom_urls + urls

    def generate_schedule(self, request):
        if request.method == 'POST':
            form = MultiWeekScheduleGenerationForm(request.POST)
            if form.is_valid():
                start_date = form.cleaned_data['start_date']
                weeks_count = form.cleaned_data['weeks_count']

                created_count, updated_count = generate_schedule_for_period(start_date, weeks_count)

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


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
#    list_display = ("date", "time", "schedule_base", "price", "is_active", "toggle_active_button")
    change_list_template = "admin/schedule_grouped.html"

    # ------------------- URL для AJAX -------------------
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'toggle_active/<int:schedule_id>/',
                self.admin_site.admin_view(self.toggle_active),
                name='toggle_active'
            ),
        ]
        return custom_urls + urls

    def toggle_active(self, request, schedule_id):
        schedule = get_object_or_404(Schedule, id=schedule_id)
        schedule.is_active = not schedule.is_active
        schedule.save(update_fields=['is_active'])
        return JsonResponse({
            "success": True,
            "new_status": schedule.is_active
        })

    # ------------------- Кнопка для таблицы -------------------
    def toggle_active_button(self, obj):
        button_text = "Вкл" if obj.is_active else "Выкл"
        return f'<button class="toggle-active-btn" data-id="{obj.id}">{button_text}</button>'
    toggle_active_button.short_description = "Доступность"
    toggle_active_button.allow_tags = True

    # ------------------- Группировка -------------------
    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(request, extra_context)
        try:
            qs = response.context_data['cl'].queryset
        except (AttributeError, KeyError):
            return response

        qs = qs.order_by('schedule_base', 'date', 'time')

        grouped = []
        for base, base_slots in groupby(qs, key=attrgetter('schedule_base')):
            date_groups = []
            for date, slots in groupby(base_slots, key=attrgetter('date')):
                date_groups.append((date, list(slots)))
            grouped.append((base, date_groups))

        response.context_data['grouped_schedules'] = grouped
        return response

# 2️⃣ Регистрируем остальные модели динамически
app_models = apps.get_app_config('information').get_models()
for model in app_models:
    if model == ScheduleBase:  # уже зарегистрирован выше
        continue
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass
