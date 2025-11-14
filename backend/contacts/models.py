from django.db import models


class Contact(models.Model):
    """Модель для хранения контактной информации (только одна запись)"""
    address = models.CharField(max_length=255, verbose_name="Адрес")
    phone = models.CharField(max_length=50, verbose_name="Телефон для бронирования")
    telegram_link = models.URLField(blank=True, null=True, verbose_name="Ссылка на Telegram")
    vk_link = models.URLField(blank=True, null=True, verbose_name="Ссылка на VK")
    whatsapp_link = models.URLField(blank=True, null=True, verbose_name="Ссылка на WhatsApp")

    def __str__(self):
        return "Контактная информация"

    class Meta:
        verbose_name = 'Контактная информация'
        verbose_name_plural = 'Контактная информация'

