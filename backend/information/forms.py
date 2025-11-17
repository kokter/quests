from django import forms
from datetime import date

from .models import ScheduleBase

class MultiWeekScheduleGenerationForm(forms.Form):
    start_date = forms.DateField(
        label="Начало первой недели (понедельник)",
        initial=date.today,
        widget=forms.SelectDateWidget
    )
    weeks_count = forms.IntegerField(
        label="Количество недель для генерации",
        initial=1,
        min_value=1,
        max_value=52
    )


class ScheduleBaseAdminForm(forms.ModelForm):
    class Meta:
        model = ScheduleBase
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        placeholders = {
            "times": "Например: 09:00:00,10:30:00",
            "days": "Например: 1,3,5 (1 = понедельник … 7 = воскресенье)",
            "prices": "Например: 1000,1200 (первое время — первая цена)",
        }
        for field_name, placeholder in placeholders.items():
            field = self.fields.get(field_name)
            if not field:
                continue
            field.widget.attrs.setdefault("placeholder", placeholder)
            # Подсказка дублирует шаблон заполнения
            field.help_text = placeholder
