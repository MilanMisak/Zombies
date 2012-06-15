from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseBadRequest
from django.template import RequestContext
from django.utils import simplejson

from game.models import Player, Game, CheckIn, Bot
from game.forms import LoginForm

def index(request):
    player = get_player(request)
    if player is not None:
        # Delete old player and game objects
        if player.game and player == player.game.master:
            player.game.delete()
        player.delete()
        del request.session['player_pk']

    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['player_name']
            create_game = form.cleaned_data['create_game']

            checkin = CheckIn()
            checkin.save()
            player = Player(name=name, rand_id=Player.generate_rand_id(), checkin=checkin)

            if create_game:
                checkin = CheckIn()
                checkin.save()
                bot = Bot()
                bot.save()
                game = Game(checkin=checkin, bot=bot)
                game.save()
                player.game = game
                player.index = 1

            player.save()
            
            if create_game:
                game.master = player
                game.players.add(player)
                game.save()

            request.session['player_pk'] = player.pk
            request.session['player_rand_id'] = player.rand_id
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

def start_game(request):
    player = get_player(request)
    if player is None:
        return redirect('/')

    game = player.game
    if game is None:
        return redirect('/')

    game.start()

    return redirect('/game')

def game(request):
    player = get_player(request)
    if player is None:
        return redirect('/')
    
    game = player.game
    if game is None or game.status != 1:
        return redirect('/')

    return render(request, 'game/game.html', {'game': game})

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
        print 'NO-PLAYER'
        return HttpResponseBadRequest('NO-PLAYER')

    print 'GAME-INFO {}'.format(player)
    
    game = player.game
    if game is None:
        print 'NO-GAME FOR {}'.format(player)
        return HttpResponseBadRequest('NO-GAME')

    json = simplejson.dumps([str(game), game.status, game.get_list_of_players_names()])
    return HttpResponse(json, mimetype='application/json')

def ajax_join_game(request, game_pk):
    player = get_player(request)
    if player is None:
        return HttpResponseBadRequest('NO-PLAYER')
   
    try:
        game = Game.objects.get(pk=game_pk)
        player.game = game
        player.index = game.get_max_player_index() + 1
        player.save()
        return HttpResponse()
    except ObjectDoesNotExist:
        return HttpResponseBadRequest('NO-GAME')

def ajax_game_state(request):
    player = get_player(request)
    if player is None:
        print 'NO-PLAYER'
        return HttpResponseBadRequest('NO-PLAYER')

    print 'GAME-STATE {}'.format(player)

    game = player.game
    if game is None:
        print 'NO-GAME FOR {}'.format(player)
        return HttpResponseBadRequest('NO-GAME')

    current_player = game.get_current_player()
    if current_player:
        this_players_turn = player.pk == current_player.pk
    else:
        this_players_turn = False
    last_players_pk = game.last_player.pk if game.last_player else -1
    if last_players_pk == 0:
        # TODO - bot
        last_players_pk = -1
    if last_players_pk == player.pk:
        # Set last player's PK to 0 if it was a move of the player sending the request
        last_players_pk = 0
    last_action = game.last_action or ''
    last_direction = game.last_direction or ''
    ammo_box = game.get_ammo_box_info()
    players = list(game.get_hash_of_players_names())
    barricades = list(game.get_list_of_barricades())
    snails = list(game.get_list_of_snails())

    json = simplejson.dumps({'yourTurn': this_players_turn, 'yourPk': player.pk,
        'currentPlayersPk': current_player.pk if current_player else -1,
        'lastPlayersPk': last_players_pk, 'turnsPlayed': game.turns_played,
        'lastAction': last_action, 'lastDirection': last_direction, 'ammo_box': ammo_box,
        'players': players, 'barricades': barricades, 'snails': snails})
    return HttpResponse(json, mimetype='application/json')

def ajax_make_turn(request, action, direction=''):
    player = get_player(request)
    if player is None:
        print 'NO-PLAYER'
        return HttpResponseBadRequest('NO-PLAYER')

    print 'MAKE-TURN {} {} {}'.format(player, action, direction)

    game = player.game
    if game is None:
        print 'NO-GAME FOR {}'.format(player)
        return HttpResponseBadRequest('NO-GAME')

    # Make the turn
    game.make_turn(player, action, direction)

    return HttpResponse()

# Utility functions

def get_player(request):
    """
    Retrieves a Player object from the session or returns None if none found.
    """
    if not 'player_pk' in request.session or not 'player_rand_id' in request.session:
        return None

    try:
        player = Player.objects.get(pk=request.session['player_pk'], rand_id=request.session['player_rand_id'])
        player.do_check_in()
        return player
    except ObjectDoesNotExist:
        return None
