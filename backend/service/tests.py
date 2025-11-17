from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from service.models import Addition, Category, Service


class AdditionApiTests(APITestCase):
    def setUp(self):
        self.category_alpha = Category.objects.create(name="Экстрим")
        self.category_beta = Category.objects.create(name="Логика")

        self.service_alpha = Service.objects.create(
            name="Катакомбы",
            url_name="catacombs",
            description="Экстремальный квест",
            is_active=True,
            cost=2500,
            peoples=4,
            minimal_age=16,
            category=self.category_alpha,
        )
        self.service_beta = Service.objects.create(
            name="Шифр",
            url_name="cipher",
            description="Логическая комната",
            is_active=True,
            cost=2000,
            peoples=3,
            minimal_age=12,
            category=self.category_beta,
        )

        self.addition_alpha = Addition.objects.create(
            name="Фото",
            description="Фотосессия",
            cost=500,
            category=self.category_alpha,
        )
        self.addition_beta = Addition.objects.create(
            name="Аниматор",
            description="Персонаж в образе",
            cost=900,
            category=self.category_beta,
        )

    def test_filter_additions_by_service_url(self):
        response = self.client.get(
            reverse("addition-list"),
            {"service_url": self.service_alpha.url_name},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.addition_alpha.id)

    def test_filter_additions_by_category(self):
        response = self.client.get(
            reverse("addition-list"),
            {"category": self.category_beta.id},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.addition_beta.id)


class ServiceByUrlTests(APITestCase):
    def setUp(self):
        category = Category.objects.create(name="Детектив")
        self.service = Service.objects.create(
            name="Интерпол",
            url_name="interpol",
            description="Расследование",
            is_active=True,
            cost=1800,
            peoples=4,
            minimal_age=10,
            category=category,
        )

    def test_service_by_url_returns_payload(self):
        response = self.client.get(
            reverse("service-by-url", args=[self.service.url_name])
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.service.id)
        self.assertEqual(response.data["url_name"], self.service.url_name)

    def test_service_by_url_returns_404_for_unknown_slug(self):
        response = self.client.get(reverse("service-by-url", args=["missing"]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
