from django.db import models

class Service(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название услуги")
    description = models.TextField(verbose_name="Описание услуги")
    is_active = models.BooleanField(default=True, verbose_name="Активна?")
    cost = models.IntegerField(verbose_name="Стоимость услуги")
    peoples = models.IntegerField(verbose_name="Количество человек")
    image = models.ImageField(upload_to='images/', blank=True, null=True, verbose_name="Изображение услуги")
    category = models.ForeignKey('Category', on_delete=models.CASCADE, verbose_name="Категория услуги")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Услуга'
        verbose_name_plural = 'Услуги'