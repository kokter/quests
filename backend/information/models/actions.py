from django.db import models

class Action(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='', verbose_name="Изображение для десктопа")
    mobile_image = models.ImageField(upload_to='', blank=True, null=True, verbose_name="Изображение для мобильных устройств")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Акция'
        verbose_name_plural = 'Акции'
        