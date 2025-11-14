from datetime import timedelta

from information.models import ScheduleBase, Schedule


def generate_schedule_for_period(start_date, weeks_count=1):
    """
    Populate the Schedule table starting from start_date for the desired number of weeks.

    Returns a tuple (created_count, updated_count).
    """
    if weeks_count < 1:
        return 0, 0

    schedule_bases = ScheduleBase.objects.all()
    created_count = 0
    updated_count = 0

    for week_number in range(weeks_count):
        week_start = start_date + timedelta(weeks=week_number)
        for base in schedule_bases:
            for day_number in base.days:
                schedule_date = week_start + timedelta(days=day_number - 1)
                for time_field, price in zip(base.times, base.prices):
                    schedule_obj, created = Schedule.objects.get_or_create(
                        schedule_base=base,
                        date=schedule_date,
                        time=time_field,
                        defaults={'price': price}
                    )
                    if created:
                        created_count += 1
                    elif schedule_obj.price != price:
                        schedule_obj.price = price
                        schedule_obj.save(update_fields=['price'])
                        updated_count += 1

    return created_count, updated_count


def delete_week_schedule(week_start, days_in_week=7):
    """
    Remove every schedule slot that belongs to the week starting at week_start.
    Returns the number of deleted Schedule rows.
    """
    if days_in_week < 1:
        return 0

    week_end = week_start + timedelta(days=days_in_week - 1)
    deleted_count, _ = Schedule.objects.filter(
        date__gte=week_start,
        date__lte=week_end
    ).delete()
    return deleted_count


__all__ = ["generate_schedule_for_period", "delete_week_schedule"]
