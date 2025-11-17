from datetime import date, time, timedelta

from django.test import TestCase, override_settings
from django.utils import timezone

from information.management.commands.generate_schedule import (
    delete_week_schedule,
    generate_schedule_for_period,
)
from information.models import Schedule, ScheduleBase
from information.tasks import cleanup_old_schedule, generate_future_schedule
from service.models import Category, Service


class ScheduleGenerationTests(TestCase):
    def setUp(self):
        category = Category.objects.create(name="Категория")
        service = Service.objects.create(
            name="Квест",
            url_name="quest",
            description="Описание",
            is_active=True,
            cost=1000,
            peoples=4,
            minimal_age=12,
            category=category,
        )
        self.schedule_base = ScheduleBase.objects.create(
            service=service,
            days=[1, 3],
            times=[time(10, 0), time(12, 0)],
            prices=[500, 700],
        )

    def test_generate_schedule_creates_and_updates_slots(self):
        start_date = date(2024, 1, 1)

        created, updated = generate_schedule_for_period(start_date, weeks_count=1)
        total_slots = len(self.schedule_base.days) * len(self.schedule_base.times)

        self.assertEqual(created, total_slots)
        self.assertEqual(updated, 0)
        self.assertEqual(Schedule.objects.count(), total_slots)

        # Price change should update existing rows without creating duplicates
        self.schedule_base.prices = [800, 900]
        self.schedule_base.save(update_fields=["prices"])

        created, updated = generate_schedule_for_period(start_date, weeks_count=1)
        self.assertEqual(created, 0)
        self.assertEqual(updated, total_slots)

    def test_delete_week_schedule_removes_expected_rows(self):
        start_date = date(2024, 2, 5)
        generate_schedule_for_period(start_date, weeks_count=1)

        deleted = delete_week_schedule(start_date, days_in_week=7)
        self.assertEqual(deleted, 4)
        self.assertEqual(Schedule.objects.count(), 0)


class ScheduleTaskTests(TestCase):
    def setUp(self):
        category = Category.objects.create(name="Scheduling")
        service = Service.objects.create(
            name="Плановый квест",
            url_name="scheduled-quest",
            description="Описание",
            is_active=True,
            cost=1500,
            peoples=6,
            minimal_age=10,
            category=category,
        )
        self.schedule_base = ScheduleBase.objects.create(
            service=service,
            days=[1],
            times=[time(9, 0)],
            prices=[600],
        )

    @override_settings(AUTO_SCHEDULE_WEEKS_AHEAD=2)
    def test_generate_future_schedule_task_creates_target_week(self):
        today = timezone.localdate()
        current_week_start = today - timedelta(days=today.weekday())
        expected_week = current_week_start + timedelta(weeks=3)

        result = generate_future_schedule.run(weeks_ahead=3)

        self.assertEqual(result["week_start"], expected_week.isoformat())
        self.assertEqual(result["created"], 1)
        self.assertEqual(result["updated"], 0)
        self.assertTrue(
            Schedule.objects.filter(
                date=expected_week + timedelta(days=self.schedule_base.days[0] - 1),
                schedule_base=self.schedule_base,
            ).exists()
        )

    @override_settings(AUTO_SCHEDULE_KEEP_DAYS=5)
    def test_cleanup_old_schedule_task_removes_only_old_slots(self):
        today = timezone.localdate()
        old_date = today - timedelta(days=10)
        recent_date = today - timedelta(days=2)

        Schedule.objects.create(
            schedule_base=self.schedule_base,
            date=old_date,
            time=time(9, 0),
            price=600,
        )
        Schedule.objects.create(
            schedule_base=self.schedule_base,
            date=recent_date,
            time=time(9, 0),
            price=600,
        )

        result = cleanup_old_schedule.run(keep_days=3)

        self.assertEqual(result["deleted"], 1)
        self.assertFalse(Schedule.objects.filter(date=old_date).exists())
        self.assertTrue(Schedule.objects.filter(date=recent_date).exists())
