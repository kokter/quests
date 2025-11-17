from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from information.models import Schedule


class Command(BaseCommand):
    help = "�?�?���>�?��' ��������?�� �?���?����?���?��?, �?���'�� ��?�'�?�?�<�: �?���?�?�?�� �'���?�%��?�? �?�?�?."

    def add_arguments(self, parser):
        parser.add_argument(
            "--keep-days",
            type=int,
            default=getattr(settings, "AUTO_SCHEDULE_KEEP_DAYS", 0),
            help="����?�>�?��? ���?�>�?�<�: �?�?��� �? ���?�?�?�>�?�? �?�?�:�?���?�?�'�?. "
                 "�?�? �?�?�?�>�ؐ��?��? settings.AUTO_SCHEDULE_KEEP_DAYS (��? �����?? 0).",
        )

    def handle(self, *args, **options):
        today = timezone.localdate()
        keep_days = max(0, options["keep_days"])
        cutoff_date = today - timedelta(days=keep_days)

        qs = Schedule.objects.filter(date__lt=cutoff_date)
        deleted_count, _ = qs.delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"�?�?���>��?�? {deleted_count} ��������?��� �?���?����?���?��? �?�'���?�?�� {cutoff_date.isoformat()}."
            )
        )

