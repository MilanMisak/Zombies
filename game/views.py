from django.shortcuts import render_to_response

def index(request):
    return render_to_response('game/index.html')

def game(request):
    return render_to_response('game/game.html')
