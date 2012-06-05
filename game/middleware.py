from game.models import *

class CleanUpMiddleware(object):
    def process_request(self, request):
        Game.clean_up()
        Player.clean_up()
