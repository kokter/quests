from django.db import models


class CompletedOrders(models.Model):
    service_name = models.CharField(max_length=200, verbose_name="Услуга")
    additions_list = models.TextField(verbose_name="Дополнения", blank=True)
    schedule_datetime = models.CharField(max_length=100, verbose_name='Дата и время')
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, editable=False, default=0)
    name = models.CharField(max_length=120, verbose_name='Имя и Фамилия')
    email = models.EmailField(blank=True, verbose_name="Email")
    phone = models.CharField(max_length=20, verbose_name='Номер телефона')
    comment = models.CharField(max_length=200, verbose_name="Комментарий пользователя")
    admin_comment = models.CharField(max_length=150, verbose_name="Комментарий администратора")

    def __str__(self):
        return f"{self.name} — {self.service_name} ({self.schedule_datetime})"

    class Meta:
        verbose_name = "Завершенный заказ"
        verbose_name_plural = "Завершенные заказы"