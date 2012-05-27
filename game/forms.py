from django import forms

class LoginForm(forms.Form):
    player_name = forms.CharField(
        max_length=50,
        label='Player Name:',
        error_messages={'required': 'Yo dawg, tell me your name'})
    create_game = forms.BooleanField(
        initial=True)
