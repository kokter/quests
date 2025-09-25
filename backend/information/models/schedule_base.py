from django.contrib.postgres.fields import ArrayField
from django.db import models

from service.models import Service


class ScheduleBase(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, verbose_name="Услуга")
    times = ArrayField(models.TimeField(), verbose_name="Список времени в которое работает услуга")
    days = ArrayField(models.IntegerField(), verbose_name="Номера дней недель по которым работает услуга(Понедельник - 1, Воскресенье - 7")
    prices = ArrayField(models.IntegerField(), verbose_name="Цена услуги в определенное время(Первое время - первая цена)")

    def __str__(self):
        return self.service.name

    class Meta:
        verbose_name = 'Шаблон расписания'
        verbose_name_plural = 'Шаблоны расписания'