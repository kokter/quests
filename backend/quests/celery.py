import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "quests.settings")

app = Celery("quests")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):  # pragma: no cover - helper for troubleshooting
    print(f"Request: {self.request!r}")

