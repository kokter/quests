# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Contact',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('address', models.CharField(max_length=255, verbose_name='Адрес')),
                ('phone', models.CharField(max_length=50, verbose_name='Телефон для бронирования')),
                ('telegram_link', models.URLField(blank=True, null=True, verbose_name='Ссылка на Telegram')),
                ('vk_link', models.URLField(blank=True, null=True, verbose_name='Ссылка на VK')),
                ('whatsapp_link', models.URLField(blank=True, null=True, verbose_name='Ссылка на WhatsApp')),
            ],
            options={
                'verbose_name': 'Контактная информация',
                'verbose_name_plural': 'Контактная информация',
            },
        ),
    ]

