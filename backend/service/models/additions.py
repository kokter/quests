from django.db import models

class Addition(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название дополнения")
    description = models.TextField(verbose_name="Описание дополнения")
    cost = models.IntegerField(verbose_name="Стоимость дополнения")
    image = models.ImageField(upload_to='images/', blank=True, null=True, verbose_name="Изображение дополнения")
    category = models.ForeignKey('Category', on_delete=models.CASCADE, verbose_name="Категория дополнения")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Дополнение'
        verbose_name_plural = 'Дополнения'