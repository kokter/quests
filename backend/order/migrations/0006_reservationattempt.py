from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("order", "0005_order_status_created_at"),
    ]

    operations = [
        migrations.CreateModel(
            name="ReservationAttempt",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("ip_address", models.GenericIPAddressField(verbose_name="IP адрес")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Попытка бронирования",
                "verbose_name_plural": "Попытки бронирования",
            },
        ),
        migrations.AddIndex(
            model_name="reservationattempt",
            index=models.Index(fields=["ip_address", "created_at"], name="order_reser_ip_addre_4bf4dd_idx"),
        ),
    ]
