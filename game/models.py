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
    def get_str_list_of_games():
        time = datetime.now() - timedelta(seconds=10)
        return [str(game) for game in Game.objects.filter(last_checked_in__gte=time)]

    def master(self):
        return self.players.all()[0]

    def get_str_list_of_players(self):
        return [str(player) for player in self.players.all()]

    def __unicode__(self):
        return "{0!s}'s game".format(self.master())
