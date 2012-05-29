from django.db import models


class Player(models.Model):
    name = models.CharField(max_length=50)
    game = models.ForeignKey('Game', related_name='players')
    
    def __unicode__(self):
        return self.name

class Game(models.Model):
    def master(self):
        return self.players.all()[0]

    def __unicode__(self):
        return str(self.players.all().count())
