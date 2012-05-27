from django import forms

class LoginForm(forms.Form):
    player_name = forms.CharField(max_length=50, label='Player Name:')
