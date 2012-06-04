from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseBadRequest
from django.template import RequestContext
from django.utils import simplejson

from game.models import Player, Game
from game.forms import LoginForm

def index(request):
    player = get_player(request)
    if player is not None:
        # Delete old player and game objects
        if player.game and player == player.game.master():
            player.game.delete()
        player.delete()
        del request.session['player_pk']

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

            request.session['player_pk'] = player.pk
            request.session['player_name'] = name

            if create_game:
                return redirect('/create-game')
            else:
                return redirect('/join-game')
    else:
        form = LoginForm(initial={'player_name': request.session.get('player_name', '')})

    return render(request, 'game/index.html', {'form': form})

def create_game(request):
    player = get_player(request)
    if player is None:
        return redirect('/')

    return render(request, 'game/create_game.html')

def join_game(request):
    player = get_player(request)
    if player is None:
        return redirect('/')

    return render(request, 'game/join_game.html')

def game(request):
    return render(request, 'game/game.html')

# AJAX calls

def ajax_games(request):
    player = get_player(request)
    if player is None:
        return HttpResponseBadRequest('NO-PLAYER')

    json = simplejson.dumps(Game.get_dict_of_games(player))
    return HttpResponse(json, mimetype='application/json')

def ajax_game_info(request):
    player = get_player(request)
    if player is None:
        return HttpResponseBadRequest('NO-PLAYER')

    Game.delete_old()
    game = player.game
    if game is None:
        return HttpResponseBadRequest('NO-GAME')

    json = simplejson.dumps(game.get_list_of_players_names())
    return HttpResponse(json, mimetype='application/json')

def ajax_join_game(request, game_pk):
    player = get_player(request)
    if player is None:
        return HttpResponseBadRequest('NO-PLAYER')
   
    try:
        game = Game.objects.get(pk=game_pk)
        player.game = game
        player.save()
        return HttpResponse()
    except ObjectDoesNotExist:
        return HttpResponseBadRequest('NO-GAME')

# Utility functions

def get_player(request):
    """
    Retrieves a Player object from the session or returns None if none found.
    """
    if not 'player_pk' in request.session:
        return None

    try:
        player = Player.objects.get(pk=request.session['player_pk'])
        player.check_in()
        return player
    except ObjectDoesNotExist:
        return None
