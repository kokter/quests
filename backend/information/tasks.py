from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.utils import timezone

from information.management.commands.generate_schedule import (
    generate_schedule_for_period,
)
from information.models import Schedule


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=60,
    retry_jitter=True,
    max_retries=3,
)
def generate_future_schedule(self, weeks_ahead=None):
    """
    Generate schedule slots for the target week (defaults to weeks_ahead from settings).
    """
    configured_weeks = getattr(settings, "AUTO_SCHEDULE_WEEKS_AHEAD", 2)
    weeks = configured_weeks if weeks_ahead is None else weeks_ahead
    weeks = max(1, int(weeks))

    today = timezone.localdate()
    current_week_start = today - timedelta(days=today.weekday())
    target_week_start = current_week_start + timedelta(weeks=weeks)

    created, updated = generate_schedule_for_period(
        target_week_start,
        weeks_count=1,
    )

    return {
        "week_start": target_week_start.isoformat(),
        "created": created,
        "updated": updated,
    }


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=60,
    retry_jitter=True,
    max_retries=3,
)
def cleanup_old_schedule(self, keep_days=None):
    """
    Remove schedule slots older than keep_days (defaults to settings).
    """
    configured_days = getattr(settings, "AUTO_SCHEDULE_KEEP_DAYS", 0)
    days = configured_days if keep_days is None else keep_days
    days = max(0, int(days))

    cutoff_date = timezone.localdate() - timedelta(days=days)
    deleted_count, _ = Schedule.objects.filter(date__lt=cutoff_date).delete()

    return {
        "cutoff_date": cutoff_date.isoformat(),
        "deleted": deleted_count,
    }
