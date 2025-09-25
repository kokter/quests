from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название категории")
    icon = models.ImageField(upload_to='images/', blank=True, null=True, verbose_name="Иконка категории")
    is_active = models.BooleanField(default=True, verbose_name="Активна?")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'