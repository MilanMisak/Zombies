from django.db import models
from datetime import datetime, timedelta

class Player(models.Model):
    name            = models.CharField(max_length=50)
    game            = models.ForeignKey('Game', related_name='players', null=True)
    last_checked_in = models.DateField(auto_now=True)
    
    def check_in(self):
        self.save()
        if self.game and self.game.master() == self:
            self.game.save()

    def __unicode__(self):
        return self.name

class Game(models.Model):
    last_checked_in = models.DateTimeField(auto_now=True)
   
    @staticmethod
    def get_dict_of_games(player):
        """
        Returns a dictionary of games not joined by the given player
        (PK : string representation).
        """
        # Get only recently created/checked-in games
        time = datetime.now() - timedelta(seconds=10)

        # Exclude the game joined by the player
        exclude_pk = player.game.pk if player.game is not None else -1

        return {game.pk : str(game) for game in Game.objects.filter(last_checked_in__gte=time).exclude(pk=exclude_pk)}

    def master(self):
        """
        Returns the game master - whoever created the game.
        """
        return self.players.all()[0]

    def get_list_of_players_names(self):
        """
        Returns a list of players' names.
        """
        return [str(player) for player in self.players.all()]

    def __unicode__(self):
        if self.players.count() == 0:
            # For the case when a game is left in the DB for longer than expected
            return "Noone's game"
        return "{0!s}'s game".format(self.master())
