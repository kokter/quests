from django.contrib import admin
from contacts.models import Contact


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('address', 'phone', 'telegram_link', 'vk_link', 'whatsapp_link')
    
    def has_add_permission(self, request):
        # Разрешаем добавление только если записей нет
        return Contact.objects.count() == 0
    
    def has_delete_permission(self, request, obj=None):
        # Запрещаем удаление, чтобы всегда была хотя бы одна запись
        return False

