import atexit
import os
import tempfile

from django.apps import AppConfig
from django.conf import settings


class InformationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'information'
    _scheduler_started = False
    _scheduler_lock = None

    def ready(self):
        if not getattr(settings, "INFORMATION_SCHEDULER_ENABLED", True):
            return
        if not self._acquire_scheduler_lock():
            return
        if self.__class__._scheduler_started:
            return
        try:
            from .scheduler import start_scheduler
            start_scheduler()
            self.__class__._scheduler_started = True
        except Exception:
            import logging
            logging.getLogger(__name__).exception("Не удалось запустить фоновый планировщик расписания")

    def _acquire_scheduler_lock(self):
        """
        Обеспечиваем запуск APScheduler только в одном процессе.
        """
        if settings.DEBUG and os.environ.get("RUN_MAIN") != "true":
            return False

        default_lock = os.path.join(tempfile.gettempdir(), "information_scheduler.lock")
        lock_path = getattr(settings, "INFORMATION_SCHEDULER_LOCK_FILE", default_lock)

        try:
            fd = os.open(lock_path, os.O_CREAT | os.O_EXCL | os.O_RDWR)
        except FileExistsError:
            return False

        os.write(fd, str(os.getpid()).encode())
        self.__class__._scheduler_lock = (fd, lock_path)

        def cleanup():
            fd_, path_ = self.__class__._scheduler_lock or (None, None)
            if fd_ is not None:
                try:
                    os.close(fd_)
                except OSError:
                    pass
            if path_:
                try:
                    os.remove(path_)
                except OSError:
                    pass

        atexit.register(cleanup)
        return True
