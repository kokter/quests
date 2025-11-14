from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from information.models import Schedule


class Command(BaseCommand):
    help = "Удаляет записи расписания, дата которых раньше текущего дня."

    def add_arguments(self, parser):
        parser.add_argument(
            "--keep-days",
            type=int,
            default=0,
            help="Сколько полных дней в прошлом сохранять. По умолчанию 0 (удаляем всё до сегодняшней даты).",
        )

    def handle(self, *args, **options):
        today = timezone.localdate()
        keep_days = max(0, options["keep_days"])
        cutoff_date = today - timedelta(days=keep_days)

        qs = Schedule.objects.filter(date__lt=cutoff_date)
        deleted_count, _ = qs.delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Удалено {deleted_count} записей расписания старше {cutoff_date.isoformat()}."
            )
        )
