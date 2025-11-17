from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("order", "0006_reservationattempt"),
    ]

    operations = [
        migrations.AlterField(
            model_name="reservationattempt",
            name="ip_address",
            field=models.GenericIPAddressField(blank=True, null=True, verbose_name="IP адрес"),
        ),
        migrations.AddField(
            model_name="reservationattempt",
            name="phone",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="reservationattempt",
            name="email",
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddIndex(
            model_name="reservationattempt",
            index=models.Index(fields=["phone", "created_at"], name="order_reser_phone_d67ce4_idx"),
        ),
        migrations.AddIndex(
            model_name="reservationattempt",
            index=models.Index(fields=["email", "created_at"], name="order_reser_email_15c096_idx"),
        ),
    ]
