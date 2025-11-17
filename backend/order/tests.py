from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from information.models import Schedule, ScheduleBase
from order.models import Order
from service.models import Addition, Category, Service


class OrderApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Приключения")
        self.service = Service.objects.create(
            name="Лабиринт",
            url_name="maze",
            description="Многоуровневый квест",
            is_active=True,
            cost=3000,
            peoples=5,
            minimal_age=14,
            category=self.category,
        )
        self.addition_sound = Addition.objects.create(
            name="Озвучка",
            description="Дополнительные эффекты",
            cost=400,
            category=self.category,
        )
        self.addition_photos = Addition.objects.create(
            name="Фото",
            description="Фотосессия",
            cost=600,
            category=self.category,
        )

        self.schedule_base = ScheduleBase.objects.create(
            service=self.service,
            days=[1],
            times=[timezone.now().time().replace(hour=19, minute=0, second=0, microsecond=0)],
            prices=[2500],
        )
        self.schedule = Schedule.objects.create(
            schedule_base=self.schedule_base,
            date=timezone.localdate(),
            time=timezone.now().time().replace(hour=19, minute=0, second=0, microsecond=0),
            price=2500,
        )

        self.admin = get_user_model().objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="password",
        )

    def _create_order(self, additions=None):
        payload = {
            "schedule": self.schedule.id,
            "additions": additions or [],
            "name": "Иван",
            "email": "ivan@example.com",
            "phone": "+79998887766",
            "comment": "Нужна встреча у метро",
        }
        response = self.client.post(reverse("orders-list"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return Order.objects.get(pk=response.data["id"])

    def test_create_order_sets_service_and_reserves_slot(self):
        order = self._create_order(additions=[self.addition_sound.id])

        self.assertEqual(order.service, self.service)
        self.assertEqual(order.additions.count(), 1)
        self.schedule.refresh_from_db()
        self.assertFalse(self.schedule.is_active)
        self.assertIsNotNone(self.schedule.reserved_until)

        expected_total = self.schedule.price + self.addition_sound.cost
        self.assertEqual(order.total_cost, expected_total)

    def test_double_booking_same_slot_is_prevented(self):
        self._create_order()
        response = self.client.post(
            reverse("orders-list"),
            {
                "schedule": self.schedule.id,
                "name": "Павел",
                "phone": "+79990001122",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_confirm_action_clears_hold_but_keeps_slot_unavailable(self):
        order = self._create_order()
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(reverse("orders-confirm", args=[order.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        order.refresh_from_db()
        schedule = order.schedule
        schedule.refresh_from_db()

        self.assertEqual(order.status, Order.Status.CONFIRMED)
        self.assertFalse(schedule.is_active)
        self.assertIsNone(schedule.reserved_until)

    def test_cancel_action_reactivates_slot_when_hold_is_active(self):
        order = self._create_order()
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(reverse("orders-cancel", args=[order.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        order.refresh_from_db()
        schedule = order.schedule
        schedule.refresh_from_db()

        self.assertEqual(order.status, Order.Status.CANCELLED)
        self.assertTrue(schedule.is_active)
        self.assertIsNone(schedule.reserved_until)

    def test_cancel_action_should_reactivate_even_if_hold_expired(self):
        order = self._create_order()
        schedule = order.schedule
        schedule.reserved_until = timezone.now() - timedelta(minutes=5)
        schedule.is_active = False
        schedule.save(update_fields=["reserved_until", "is_active"])

        self.client.force_authenticate(user=self.admin)
        response = self.client.post(reverse("orders-cancel", args=[order.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        schedule.refresh_from_db()
        self.assertTrue(
            schedule.is_active,
            "Отмененный слот должен снова стать активным, даже если hold уже истек.",
        )
