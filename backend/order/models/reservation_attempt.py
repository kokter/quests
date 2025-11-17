from django.db import models


class ReservationAttempt(models.Model):
    ip_address = models.GenericIPAddressField(verbose_name="IP адрес", null=True, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["ip_address", "created_at"]),
            models.Index(fields=["phone", "created_at"]),
            models.Index(fields=["email", "created_at"]),
        ]
        verbose_name = "Попытка бронирования"
        verbose_name_plural = "Попытки бронирования"

    def __str__(self):
        identifier = self.ip_address or self.phone or self.email or "unknown"
        return f"{identifier} @ {self.created_at:%Y-%m-%d %H:%M:%S}"
