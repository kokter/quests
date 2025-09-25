from django import forms
from datetime import date

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
