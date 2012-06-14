from django.db import models
from django.db.models.signals import pre_delete
from django.core.exceptions import ObjectDoesNotExist
from django.dispatch import receiver

from datetime import datetime, timedelta

def is_valid_direction(direction):
    """
    Checks if a given direction is a valid direction.
    """
    return True if direction == 'Up' or direction == 'Right' or direction == 'Down' or direction == 'Left' else False

class Room(object):

    def __init__(self, up_room, right_room, down_room, left_room,
        up_barricade, right_barricade, down_barricade, left_barricade):
        self.up_room         = up_room
        self.right_room       = right_room
        self.down_room      = down_room
        self.left_room        = left_room
        self.up_barricade    = up_barricade
        self.right_barricade  = right_barricade
        self.down_barricade = down_barricade
        self.left_barricade   = left_barricade

    def get_room_in_direction(self, direction):
        if direction == 'Up':
            return self.up_room
        elif direction == 'Right':
            return self.right_room
        elif direction == 'Down':
            return self.down_room
        elif direction == 'Left':
            return self.left_room
        return -1
    
    def get_barricade_in_direction(self, direction):
        if direction == 'Up':
            return self.up_barricade
        elif direction == 'Right':
            return self.right_barricade
        elif direction == 'Down':
            return self.down_barricade
        elif direction == 'Left':
            return self.left_barricade
        return -1

    def __str__(self):
        return 'Room with {} {} {} {}'.format(self.top, self.right, self.bottom, self.left)

# Up, right, bottom, left
ROOMS = [
    Room(-1, 1, -1, -1, -1, 0, -1, -1),
    Room(-1, 2, -1, 0, -1, 1, -1, 0),
    Room(7, 3, -1, 1, 6, 2, -1, 1),
    Room(-1, 4, -1, 2, -1, 3, -1, 2),
    Room(8, 5, -1, 3, 7, 4, -1, 3),
    Room(-1, 6, -1, 4, -1, 5, -1, 4),
    Room(-1, -1, -1, 5, -1, -1, -1, 5),
    Room(10, -1, 2, -1, 9, -1, 6, -1),
    Room(-1, 9, 4, -1, -1, 8, 7, -1),
    Room(14, -1, -1, 8, 10, -1, -1, 8),
    Room(15, 11, 7, -1, 15, 11, 9, -1),
    Room(-1, 12, -1, 10, -1, 12, -1, 11),
    Room(-1, 13, -1, 11, -1, 13, -1, 12),
    Room(18, 14, -1, 12, 16, 14, -1, 13),
    Room(-1, -1, 9, 13, -1, -1, 10, 14),
    Room(19, 16, 10, -1, 20, 17, 15, -1),
    Room(-1, 17, -1, 15, -1, 18, -1, 17),
    Room(20, 18, -1, 16, 21, 19, -1, 18),
    Room(-1, -1, 13, 17, -1, -1, 16, 19),
    Room(21, 20, 15, -1, 23, 22, 20, -1),
    Room(-1, -1, 17, 19, -1, -1, 21, 22),
    Room(-1, -1, 19, -1, -1, -1, 23, -1)
]

@receiver(pre_delete)
def pre_delete_callback(sender, instance, **kwargs):
    """
    Call back for when a model instance is deleted.
    """
    print 'DELETING {}'.format(instance)

class Player(models.Model):
    rand_id           = models.PositiveIntegerField()
    name              = models.CharField(max_length=50)
    game              = models.ForeignKey('Game', related_name='players', null=True,
                            on_delete=models.SET_NULL)
    index             = models.PositiveSmallIntegerField(null=True)
    room              = models.PositiveSmallIntegerField(default=3)
    ammo              = models.PositiveSmallIntegerField(default=5)
    carrying_ammo_box = models.BooleanField(default=False)
    last_checked_in   = models.DateTimeField(auto_now=True)
    
    @staticmethod
    def clean_up():
        """
        Deletes players not checked-in for 10 seconds or more.
        """
        time = datetime.now() - timedelta(seconds=10)
        count = Player.objects.all().count()
        Player.objects.filter(last_checked_in__lte=time).delete()
        count2 = Player.objects.all().count()
        if count != count2:
            print 'DELETED {} PLAYERS'.format(count - count2)

    def check_in(self):
        """
        Checks-in a player informing the system that the player is still online.
        """
        self.save()
        if self.game and self.game.master == self:
            self.game.save()

    def __unicode__(self):
        return self.name
        #return '{} {}'.format(self.name, self.index)

class Game(models.Model):
    master               = models.OneToOneField(Player, related_name='mastered_game', null=True)
    status               = models.PositiveSmallIntegerField(default=0) # 0 = not started, 1 = started
    current_player_index = models.PositiveSmallIntegerField(null=True)
    current_player_start = models.DateTimeField(null=True)
    last_player          = models.OneToOneField(Player, related_name='last_game', null=True)
    last_action          = models.CharField(max_length=20, null=True)
    last_direction       = models.CharField(max_length=5, null=True)
    ammo_box_room        = models.PositiveSmallIntegerField(default=3)
    ammo_box_in_transit  = models.BooleanField(default=False)
    turns_played         = models.PositiveIntegerField(default=0)
    last_checked_in      = models.DateTimeField(auto_now=True)
   
    @staticmethod
    def clean_up():
        """
        Deletes games not checked-in for 10 seconds or more.
        """
        time = datetime.now() - timedelta(seconds=10)
        Game.objects.filter(last_checked_in__lte=time).delete()

    @staticmethod
    def get_dict_of_games(player):
        """
        Returns a dictionary of games not joined by the given player
        (PK : string representation).
        """
        # Exclude the game joined by the player
        exclude_pk = player.game.pk if player.game is not None else -1
        return {game.pk : str(game) for game in Game.objects.exclude(pk=exclude_pk)}

    def start(self):
        """
        Starts the game.
        """
        self.current_player_index = 1
        self.current_player_start = datetime.now()
        self.status = 1
        self.save()

    def make_turn(self, player, action, direction):
        """
        Makes the turn with the given player.
        """
        if self.current_player_index != player.index:
            return

        if action == 'Move':
            if not self.action_move(player, direction):
                return
        elif action == 'Barricade':
            if not self.action_barricade(player, direction):
                return
        elif action == 'Debarricade':
            if not self.action_debarricade(player, direction):
                return
        elif action == 'Ammo':
            if not self.action_ammo(player):
                return
        else:
            # Action is not supported
            print 'INVALID ACTION {}'.format(action)
            player.delete()
            return

        self.last_player = player
        self.last_action = action
        self.last_direction = direction
        self.turns_played = self.turns_played + 1
        self.change_turns() # This does the save()

    def action_move(self, player, direction):
        """
        Executes the MOVE action.
        """
        new_room = ROOMS[player.room].get_room_in_direction(direction)
        if new_room == -1:
            # Destination room does not exist
            print 'INVALID ROOM: from {} going {}'.format(player.room, direction)
            player.delete()
            return False

        barricade_index = ROOMS[player.room].get_barricade_in_direction(direction)
        if barricade_index != -1 and self.barricades.filter(index=barricade_index).count() > 0:
            # There's a barricade in the way
            print 'BARRICADE IN THE WAY'
            player.delete()
            return False

        print 'PLAYER {} MOVING TO {}'.format(player.name, new_room)
        # Assign a new room to the player
        player.room = new_room
        player.save()
        return True

    def action_barricade(self, player, direction):
        """
        Executes the BARRICADE action.
        """
        if not is_valid_direction(direction):
            # Invalid direction
            print 'INVALID DIRECTION {} FROM {}'.format(direction, player.room)
            player.delete()
            return False

        barricade_index = ROOMS[player.room].get_barricade_in_direction(direction)
        if barricade_index == -1:
            # Can't barricade in this direction
            print 'INVALID DIRECTION {} FROM {}'.format(direction, player.room)
            player.delete()
            return False

        query = self.barricades.filter(index=barricade_index)
        if query.count() > 0:
            # Barricade already exists - repair it
            barricade = query[0]
            barricade.health = 100
            barricade.save()
            return True

        # Create a new barricade
        barricade = Barricade(game=self, index=barricade_index)
        barricade.save()
        return True

    def action_debarricade(self, player, direction):
        """
        Executes the DEBARRICADE action.
        """
        if not is_valid_direction(direction):
            # Invalid direction
            print 'INVALID DIRECTION'
            player.delete()
            return False

        barricade_index = ROOMS[player.room].get_barricade_in_direction(direction)
        if barricade_index == -1:
            # Can't debarricade in this direction
            print 'INVALID DIRECTION'
            player.delete()
            return False

        query = self.barricades.filter(index=barricade_index)
        if query.count() == 0:
            # Barricade does not exist
            print 'BARRICADE DOES NOT EXIST'
            player.delete()
            return False

        # Delete the barricade
        barricade = query[0]
        barricade.delete()
        return True

    def action_ammo(self, player):
        """
        Executes the AMMO action (picking up/dropping the ammo box).
        """
        if player.carrying_ammo_box:
            # Player is carrying the ammo box, so he can drop it
            player.carrying_ammo_box = False
            self.ammo_box_room = player.room
            self.ammo_box_in_transit = False
        elif self.ammo_box_in_transit or self.ammo_box_room != player.room:
            # Ammo box in transit or in a different room than the player
            print 'AMMO BOX IN TRANSIT OR IN A DIFFERENT ROOM'
            player.delete()
            return False
        else:
            # Pick up the ammo box
            player.carrying_ammo_box = True
            self.ammo_box_in_transit = True

        # Save all the changes
        player.save()
        self.save()
        return True

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

    def get_hash_of_players_names(self):
        """
        Returns a hash with players PKs and names.
        """
        return self.players.values('pk', 'name', 'index', 'room', 'ammo')

    def get_list_of_barricades(self):
        """
        Returns a list of barricades with their indices and health.
        """
        return self.barricades.values('index', 'health')

    def get_max_player_index(self):
        """
        Returns the maximum player index in this game.
        """
        return self.players.order_by('-index')[0].index

    def get_current_player(self):
        """
        Returns the player, whose turn it is.
        """
        # Timeout after 15 seconds
        timeout_time = self.current_player_start + timedelta(seconds=15)
        if timeout_time < datetime.now():
            # Current player timed out, change him
            return self.change_turns()
        else:
            try:
                current_player = self.players.get(index=self.current_player_index)
                return current_player
            except ObjectDoesNotExist:
                # Current player got removed
                return self.change_turns()

    def change_turns(self):
        """
        Ensures that it is the next player's turn now. Returns the next player.
        """
        results = self.players.order_by('index').filter(index__gt=self.current_player_index)
        if results.exists():
            next_player = results[0]
        else:
            next_player = self.players.order_by('index')[0]
        self.current_player_index = next_player.index
        self.current_player_start = datetime.now()
        self.save()
        return next_player

    def __unicode__(self):
        if self.players.count() == 0:
            # For the case when a game is left in the DB for longer than expected
            return "Noone's game"
        return "{0!s}'s game".format(self.master)

class Barricade(models.Model):
    game = models.ForeignKey(Game, related_name='barricades')
    index = models.PositiveIntegerField()
    health = models.PositiveIntegerField(default=100)

    def __unicode__(self):
        return 'Barricade {} with health {}'.format(self.index, self.health)
