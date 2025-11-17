from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from information.models import Schedule, ScheduleBase
from order.models import Order
from service.models import Category, Service


class ScheduleApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Экшн")
        self.service_a = Service.objects.create(
            name="Закулисье",
            url_name="backstage",
            description="За кулисами театра",
            is_active=True,
            cost=2500,
            peoples=4,
            minimal_age=14,
            category=self.category,
        )
        self.service_b = Service.objects.create(
            name="Погружение",
            url_name="immersion",
            description="Погружение в атмосферу",
            is_active=True,
            cost=3100,
            peoples=5,
            minimal_age=12,
            category=self.category,
        )
        self.base_a = ScheduleBase.objects.create(
            service=self.service_a,
            days=[1, 3],
            times=[time(10, 0), time(12, 0)],
            prices=[2000, 2300],
        )
        self.base_b = ScheduleBase.objects.create(
            service=self.service_b,
            days=[2],
            times=[time(15, 0)],
            prices=[2800],
        )

    def test_filters_by_service_url_and_releases_expired_slots(self):
        expired_slot = Schedule.objects.create(
            schedule_base=self.base_a,
            date=date.today(),
            time=time(10, 0),
            price=2100,
            is_active=False,
            reserved_until=timezone.now() - timedelta(hours=2),
        )
        Schedule.objects.create(
            schedule_base=self.base_b,
            date=date.today(),
            time=time(15, 0),
            price=2800,
        )
        pending_order = Order.objects.create(
            service=self.service_a,
            schedule=expired_slot,
            name="Алексей",
            email="client@example.com",
            phone="+70000000000",
        )

        response = self.client.get(
            reverse("schedule-list"),
            {"service_url": self.service_a.url_name},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], expired_slot.id)
        self.assertTrue(response.data[0]["is_active"])

        expired_slot.refresh_from_db()
        self.assertTrue(expired_slot.is_active)
        self.assertIsNone(expired_slot.reserved_until)

        pending_order.refresh_from_db()
        self.assertEqual(pending_order.status, Order.Status.CANCELLED)


class OrderCancellationTests(APITestCase):
    def setUp(self):
        category = Category.objects.create(name="Эксперимент")
        self.service = Service.objects.create(
            name="Загадка",
            url_name="enigma",
            description="Тестовое описание",
            is_active=True,
            cost=1500,
            peoples=3,
            minimal_age=10,
            category=category,
        )
        self.base = ScheduleBase.objects.create(
            service=self.service,
            days=[4],
            times=[time(18, 0)],
            prices=[1500],
        )
        self.admin = get_user_model().objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="password",
        )

    def test_cancel_action_should_reactivate_slots_even_if_hold_expired(self):
        expired_slot = Schedule.objects.create(
            schedule_base=self.base,
            date=date.today(),
            time=time(18, 0),
            price=1500,
            is_active=False,
            reserved_until=timezone.now() - timedelta(hours=1),
        )
        order = Order.objects.create(
            service=self.service,
            schedule=expired_slot,
            name="Мария",
            email="user@example.com",
            phone="+71111111111",
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            reverse("orders-cancel", args=[order.pk]),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        expired_slot.refresh_from_db()
        self.assertTrue(
            expired_slot.is_active,
            "Отмененный слот должен снова стать активным, даже если hold уже истек.",
        )
        self.assertIsNone(expired_slot.reserved_until)

        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.CANCELLED)
