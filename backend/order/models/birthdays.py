from django.db import models

class BirthdayClient(models.Model):
    name = models.CharField(max_length=255, verbose_name="Имя клиента")
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    birthday = models.CharField(max_length=5, verbose_name="День и месяц (ДД.ММ)")

    def __str__(self):
        return f"{self.name} ({self.birthday})"

    class Meta:
        verbose_name = "День рождения"
        verbose_name_plural = "Дни рождения"