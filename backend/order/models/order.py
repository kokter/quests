from django.db import models
from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from information.models import Schedule
from service.models import Addition, Service


class Order(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, verbose_name="Услуга")
    additions = models.ManyToManyField(Addition, verbose_name="Дополнения", blank=True)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, verbose_name='Дата и время')
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, editable=False, default=0)
    name = models.CharField(max_length=120, verbose_name='Имя и Фамилия')
    email = models.EmailField(blank=True, verbose_name="Email")
    phone = models.CharField(max_length=20, verbose_name='Номер телефона')
    comment = models.CharField(max_length=200, verbose_name="Комментарий пользователя")
    admin_comment = models.CharField(max_length=150, verbose_name="Комментарий администратора")

    def calculate_total_cost(self):
        base_price = self.schedule.price if self.schedule else 0
        additions_price = sum(addition.cost for addition in self.additions.all())
        return base_price + additions_price

    def save(self, *args, **kwargs):
        # сохраняем сначала, чтобы был id для ManyToMany
        super().save(*args, **kwargs)
        # обновляем total_cost
        total = self.calculate_total_cost()
        if self.total_cost != total:
            self.total_cost = total
            super().save(update_fields=["total_cost"])


# сигнал для пересчета при изменении ManyToMany (additions)
@receiver(m2m_changed, sender=Order.additions.through)
def update_total_cost(sender, instance, action, **kwargs):
    if action in ["post_add", "post_remove", "post_clear"]:
        total = instance.calculate_total_cost()
        if instance.total_cost != total:
            instance.total_cost = total
            instance.save(update_fields=["total_cost"])
