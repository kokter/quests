from datetime import timedelta

from django.db import transaction

from information.models import Schedule, ScheduleBase


def _iter_slots(schedule_base, start_date, weeks_count):
    """
    Yield tuples of (date, time, price) for each configured slot across weeks.
    """
    prices = list(schedule_base.prices or [])
    times = list(schedule_base.times or [])
    days = list(schedule_base.days or [])

    for week in range(max(weeks_count, 1)):
        week_start = start_date + timedelta(weeks=week)
        for day_index, day_of_week in enumerate(days):
            slot_date = week_start + timedelta(days=day_of_week - 1)
            for time_index, slot_time in enumerate(times):
                price_index = min(time_index, len(prices) - 1) if prices else 0
                slot_price = prices[price_index] if prices else 0
                yield slot_date, slot_time, slot_price


def generate_schedule_for_period(start_date, weeks_count=1):
    """
    Create or update Schedule rows for each ScheduleBase between start_date and
    start_date + weeks_count.
    """
    total_created = 0
    total_updated = 0
    bases = ScheduleBase.objects.select_related("service").all()

    for schedule_base in bases:
        with transaction.atomic():
            for slot_date, slot_time, slot_price in _iter_slots(
                schedule_base, start_date, weeks_count
            ):
                schedule = Schedule.objects.filter(
                    schedule_base=schedule_base,
                    date=slot_date,
                    time=slot_time,
                ).first()

                if schedule:
                    if schedule.price != slot_price:
                        schedule.price = slot_price
                        schedule.save(update_fields=["price"])
                        total_updated += 1
                    continue

                Schedule.objects.create(
                    schedule_base=schedule_base,
                    date=slot_date,
                    time=slot_time,
                    price=slot_price,
                )
                total_created += 1

    return total_created, total_updated


def delete_week_schedule(start_date, days_in_week=7):
    """
    Remove schedule slots from start_date for the specified number of days.
    """
    end_date = start_date + timedelta(days=days_in_week)
    deleted, _ = Schedule.objects.filter(
        date__gte=start_date,
        date__lt=end_date,
    ).delete()
    return deleted
