from django.db import models

from information.models.schedule_base import ScheduleBase


class Schedule(models.Model):
    date = models.DateField(verbose_name='Дата')
    schedule_base = models.ForeignKey(ScheduleBase, on_delete=models.CASCADE, verbose_name='Шаблон расписания')
    time = models.TimeField(verbose_name='Время')
    price = models.IntegerField(verbose_name='Цена')

    def __str__(self):
        return f'{self.date.strftime("%d-%m-%Y")} - {self.time}, {self.schedule_base}'

    class Meta:
        verbose_name = 'Расписание'
        verbose_name_plural = 'Расписание'
        ordering = ["date", "time"]