from django.db import models


class CorporateClient(models.Model):
    name = models.CharField(max_length=120, verbose_name="Имя и Фамилия / Компания")
    phone = models.CharField(max_length=20, verbose_name="Телефон")

    def __str__(self):
        return f"{self.name} ({self.phone})"

    class Meta:
        verbose_name = "Корпоративный клиент"
        verbose_name_plural = "Корпоративные клиенты"