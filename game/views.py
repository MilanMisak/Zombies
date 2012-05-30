from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render_to_response, redirect
from django.http import HttpResponse, HttpResponseBadRequest
from django.template import RequestContext
from django.utils import simplejson
from datetime import datetime, timedelta

from game.models import Player, Game
from game.forms import LoginForm

def index(request):
    # Delete old player and game objects
    if 'player' in request.session:
        player = request.session['player']
        if player.game and player == player.game.master():
            player.game.delete()
        player.delete()
        del request.session['player']

    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():

            name = form.cleaned_data['player_name']
            create_game = form.cleaned_data['create_game']

            player = Player(name=name)

            if create_game:
                game = Game()
                game.save()
                player.game = game

            player.save()
            
            if create_game:
                game.players.add(player)
                game.save()

            request.session['player'] = player
            request.session['player_name'] = name

            if create_game:
                return redirect('/create-game')
            else:
                return redirect('/join-game')
    else:
        form = LoginForm(initial={'player_name': request.session.get('player_name', '')})

    return render_to_response('game/index.html', {'form': form}, RequestContext(request))

def create_game(request):
    if not 'player' in request.session:
        return redirect('/')

    return render_to_response('game/create_game.html')

def join_game(request):
    if not 'player' in request.session:
        return redirect('/')

    return render_to_response('game/join_game.html')

def players_in_game(request):
    if not 'player' in request.session:
        return HttpResponseBadRequest()
        
    player = request.session['player']
    player.save() # check-in

    # TODO - really need to check for this?
    try:
        game = player.game

        if game.master() == player:
            print 'check in'
            game.save() # check-in

        players = [str(player) for player in game.players.all()]

        json = simplejson.dumps(players)
        return HttpResponse(json, mimetype='application/json')
    except ObjectDoesNotExist:
        return HttpResponseBadRequest()

def games(request):
    if not 'player' in request.session:
        return HttpResponseBadRequest()
        
    player = request.session['player']
    player.save() # check-in

    time = datetime.now() - timedelta(seconds=10)
    print time
    games = [str(game) for game in Game.objects.filter(last_checked_in__gte=time)]

    json = simplejson.dumps(games)
    return HttpResponse(json, mimetype='application/json')

def game(request):
    return render_to_response('game/game.html')
