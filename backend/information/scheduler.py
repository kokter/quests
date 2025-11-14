import atexit
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.conf import settings
from django.core.management import call_command
from django.utils import timezone

logger = logging.getLogger(__name__)

_scheduler = None


def _run_command(command_name):
    logger.info("%s job started", command_name)
    try:
        call_command(command_name)
    except Exception:  # pragma: no cover - logging unexpected failures
        logger.exception("%s job failed", command_name)
        raise
    else:
        logger.info("%s job finished successfully", command_name)


def start_scheduler():
    global _scheduler
    generation_enabled = getattr(settings, "AUTO_SCHEDULE_ENABLED", True)
    cleanup_enabled = getattr(settings, "AUTO_SCHEDULE_CLEANUP_ENABLED", True)

    if not (generation_enabled or cleanup_enabled):
        logger.info("Автопланировщик выключен настройками, задач нет")
        return

    if _scheduler and _scheduler.running:
        return

    tz = timezone.get_default_timezone()

    _scheduler = BackgroundScheduler(timezone=tz)

    def add_cron_job(job_id, command_name, config, default_kwargs):
        trigger_kwargs = config or default_kwargs
        trigger = CronTrigger(timezone=tz, **trigger_kwargs)
        _scheduler.add_job(
            _run_command,
            trigger=trigger,
            id=job_id,
            replace_existing=True,
            args=[command_name],
        )
        logger.info("%s cron started с параметрами %s", job_id, trigger_kwargs)

    if generation_enabled:
        add_cron_job(
            "auto_generate_schedule",
            "auto_generate_schedule",
            getattr(settings, "AUTO_SCHEDULE_CRON", None),
            {"day_of_week": "sun", "hour": 4, "minute": 0},
        )

    if cleanup_enabled:
        add_cron_job(
            "purge_old_schedule",
            "purge_old_schedule",
            getattr(settings, "AUTO_SCHEDULE_CLEANUP_CRON", None),
            {"day_of_week": "*", "hour": 3, "minute": 0},
        )

    if _scheduler.get_jobs():
        _scheduler.start()
        atexit.register(lambda: _scheduler.shutdown(wait=False))
