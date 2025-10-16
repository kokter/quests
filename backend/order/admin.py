from django.contrib import admin, messages
from django.utils.html import format_html
from django.urls import path
from django.shortcuts import redirect, get_object_or_404, render
from .models import Order, CompletedOrders, CorporateClient, BirthdayClient
from django.apps import apps

# ------------------- АДМИН ЗАКАЗОВ -------------------
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id", "name", "total_cost", "schedule",
        "mark_as_completed_button",
        "add_to_corporate_button",
        "add_to_birthday_button",
    )
    readonly_fields = ("total_cost",)

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path("<int:order_id>/complete/", self.admin_site.admin_view(self.process_complete_order), name="complete_order"),
            path("<int:order_id>/corporate/", self.admin_site.admin_view(self.add_to_corporate), name="add_to_corporate"),
            path("<int:order_id>/birthday/", self.admin_site.admin_view(self.add_to_birthday_form), name="add_to_birthday_form"),
        ]
        return custom_urls + urls

    # Кнопки
    def mark_as_completed_button(self, obj):
        return format_html('<a class="button" href="{}">✅ Завершить</a>', f"{obj.id}/complete/")
    mark_as_completed_button.short_description = "Завершить заказ"

    def add_to_corporate_button(self, obj):
        return format_html('<a class="button" href="{}">🏢 В корпоративные</a>', f"{obj.id}/corporate/")
    add_to_corporate_button.short_description = "Сохранить как корпоративного"

    def add_to_birthday_button(self, obj):
        return format_html('<a class="button" href="{}">🎂 День рождения</a>', f"{obj.id}/birthday/")
    add_to_birthday_button.short_description = "Добавить день рождения"

    # Обработчики кнопок
    def process_complete_order(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        service_name = order.service.name if order.service else "—"
        additions_names = ", ".join(a.name for a in order.additions.all())
        schedule_str = f"{order.schedule.date} {order.schedule.time}" if order.schedule else "—"

        CompletedOrders.objects.create(
            service_name=service_name,
            additions_list=additions_names,
            schedule_datetime=schedule_str,
            total_cost=order.total_cost,
            name=order.name,
            email=order.email,
            phone=order.phone,
            comment=order.comment,
            admin_comment=order.admin_comment,
        )
        order.delete()
        self.message_user(request, f"Заказ {order.id} перенесён в Завершённые.")
        return redirect("../")

    def add_to_corporate(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        exists = CorporateClient.objects.filter(name=order.name, phone=order.phone).exists()
        if exists:
            self.message_user(request, f"Клиент {order.name} уже есть в корпоративных.", level=messages.WARNING)
        else:
            CorporateClient.objects.create(name=order.name, phone=order.phone)
            self.message_user(request, f"Клиент {order.name} добавлен в корпоративные.", level=messages.SUCCESS)
        return redirect("../")

    def add_to_birthday_form(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        if request.method == "POST":
            day = request.POST.get("day")
            month = request.POST.get("month")
            if not day or not month:
                self.message_user(request, "❌ Не указан день или месяц.", level=messages.ERROR)
                return redirect("../")
            birthday_str = f"{int(day):02d}.{int(month):02d}"
            exists = BirthdayClient.objects.filter(name=order.name, phone=order.phone, birthday=birthday_str).exists()
            if exists:
                self.message_user(request, f"Клиент {order.name} с этой датой уже есть.", level=messages.WARNING)
            else:
                BirthdayClient.objects.create(name=order.name, phone=order.phone, birthday=birthday_str)
                self.message_user(request, f"🎉 Клиент {order.name} добавлен в дни рождения ({birthday_str}).", level=messages.SUCCESS)
            return redirect("../../")
        return render(request, "admin/add_birthday.html", {"order": order})

# ------------------- АДМИН ЗАВЕРШЁННЫХ -------------------
@admin.register(CompletedOrders)
class CompletedOrdersAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "service_name", "schedule_datetime", "total_cost")

# ------------------- АДМИН КОРПОРАТИВНЫХ -------------------
@admin.register(CorporateClient)
class CorporateClientAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "phone")

# ------------------- АДМИН ДНЕЙ РОЖДЕНИЯ -------------------
@admin.register(BirthdayClient)
class BirthdayClientAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "phone", "birthday")

# ------------------- ДИНАМИЧЕСКАЯ РЕГИСТРАЦИЯ ОСТАЛЬНЫХ -------------------
app_models = apps.get_app_config('order').get_models()
for model in app_models:
    if model in [Order, CompletedOrders, CorporateClient, BirthdayClient]:
        continue
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass
