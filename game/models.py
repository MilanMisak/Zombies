from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver

from datetime import datetime, timedelta

@receiver(pre_delete)
def pre_delete_callback(sender, instance, **kwargs):
    """
    Call back for when a model instance is deleted.
    """
    print 'DELETING {}'.format(instance)

class Player(models.Model):
    rand_id         = models.PositiveIntegerField()
    name            = models.CharField(max_length=50)
    game            = models.ForeignKey('Game', related_name='players', null=True,
                          on_delete=models.SET_NULL)
    index           = models.PositiveSmallIntegerField(null=True)
    last_checked_in = models.DateTimeField(auto_now=True)
    
    @staticmethod
    def clean_up():
        """
        Deletes players not checked-in for 10 seconds or more.
        """
        time = datetime.now() - timedelta(seconds=10)
        Player.objects.filter(last_checked_in__lte=time).delete()

    def check_in(self):
        """
        Checks-in a player informing the system that the player is still online.
        """
        self.save()
        if self.game and self.game.master == self:
            self.game.save()

    def __unicode__(self):
        return self.name

class Game(models.Model):
    master          = models.OneToOneField(Player, related_name='mastered_game', null=True)
    status          = models.PositiveSmallIntegerField(default=0) # 0 = not started, 1 = started
    last_checked_in = models.DateTimeField(auto_now=True)
   
    @staticmethod
    def clean_up():
        """
        Deletes games not checked-in for 10 seconds or more.
        """
        time = datetime.now() - timedelta(seconds=10)
        Game.objects.filter(last_checked_in__lte=time).delete()
        Game.objects.filter(master=None).delete()

    @staticmethod
    def get_dict_of_games(player):
        """
        Returns a dictionary of games not joined by the given player
        (PK : string representation).
        """
        # Exclude the game joined by the player
        exclude_pk = player.game.pk if player.game is not None else -1
        return {game.pk : str(game) for game in Game.objects.exclude(pk=exclude_pk)}

    def get_list_of_players(self):
        """
        Returns a list of players in the order they joined the game in.
        """
        return self.players.order_by('index').all()

    def get_list_of_players_names(self):
        """
        Returns a list of players' names.
        """
        return [str(player) for player in self.get_list_of_players()]

    def get_max_player_index(self):
        """
        Returns the maximum player index in this game.
        """
        return self.players.order_by('-index')[0].index

    def __unicode__(self):
        if self.players.count() == 0:
            # For the case when a game is left in the DB for longer than expected
            return "Noone's game"
        return "{0!s}'s game".format(self.master)
