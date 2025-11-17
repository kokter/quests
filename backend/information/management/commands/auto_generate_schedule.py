from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from information.management.commands.generate_schedule import generate_schedule_for_period


class Command(BaseCommand):
    help = (
        "Generate schedule automatically for the week after next and "
        "remove the slots of the week that has just finished."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--weeks-ahead",
            type=int,
            default=getattr(settings, "AUTO_SCHEDULE_WEEKS_AHEAD", 2),
            help="How many weeks ahead relative to the current week should be generated "
                 "(default: settings.AUTO_SCHEDULE_WEEKS_AHEAD).",
        )

    def handle(self, *args, **options):
        today = timezone.localdate()
        current_week_start = today - timedelta(days=today.weekday())

        weeks_ahead = max(1, options["weeks_ahead"])
        target_week_start = current_week_start + timedelta(weeks=weeks_ahead)

        created, updated = generate_schedule_for_period(target_week_start, weeks_count=1)

        self.stdout.write(
            self.style.SUCCESS(
                "Автогенерация завершена: "
                f"{created} новых слотов, {updated} обновлено."
            )
        )
