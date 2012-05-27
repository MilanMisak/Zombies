from django.shortcuts import render_to_response, redirect
from django.template import RequestContext

from game.forms import LoginForm

def index(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            request.session['player_name'] = form.cleaned_data['player_name']
            request.session['create_game'] = form.cleaned_data['create_game']
            return redirect('/game')
    else:
        form = LoginForm(initial={'player_name': request.session.get('player_name', '')})

    return render_to_response('game/index.html', {'form': form}, RequestContext(request))

def game(request):
    return render_to_response('game/game.html')
