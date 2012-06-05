from game.models import *

class CleanUpMiddleware(object):
    """
    Deletes old games and players.
    """

    def process_request(self, request):
        Game.clean_up()
        Player.clean_up()
