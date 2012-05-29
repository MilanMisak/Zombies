from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render_to_response, redirect
from django.http import HttpResponse, HttpResponseBadRequest
from django.template import RequestContext
from django.utils import simplejson

from game.models import Player, Game
from game.forms import LoginForm

def index(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            if 'player' in request.session:
                player = request.session['player']
                player.game.delete()
                player.delete()

            game = Game()
            game.save()

            name = form.cleaned_data['player_name']
            player = Player(name=name, game=game)
            player.game = game
            player.save()
            
            game.players.add(player)
            game.save()

            request.session['player'] = player
            request.session['player_name'] = name
            request.session['create_game'] = form.cleaned_data['create_game']

            return redirect('/create-game')
    else:
        form = LoginForm(initial={'player_name': request.session.get('player_name', '')})

    return render_to_response('game/index.html', {'form': form}, RequestContext(request))

def create_game(request):
    return render_to_response('game/create_game.html')

def players_in_game(request, game_id):
    try:
        game = Game.objects.get(pk=game_id)
        players = [str(player) for player in game.players.all()]

        json = simplejson.dumps(players)
        return HttpResponse(json, mimetype='application/json')
    except ObjectDoesNotExist:
        return HttpResponseBadRequest()

def game(request):
    return render_to_response('game/game.html')
