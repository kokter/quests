from django.contrib import admin
from .models import Order
from django.apps import apps

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "total_cost", "schedule")
    readonly_fields = ("total_cost",)  # отображаем, но нельзя редактировать

# регистрируем остальные модели динамически
app_models = apps.get_app_config('order').get_models()
for model in app_models:
    if model == Order:
        continue
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass
