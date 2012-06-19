from django.db import models
from django.db.models.signals import pre_delete
from django.core.exceptions import ObjectDoesNotExist
from django.dispatch import receiver

import math
from datetime import datetime, timedelta
from random import getrandbits, randint, random
from heapq import *

def is_valid_direction(direction):
    """
    Checks if a given direction is a valid direction.
    """
    return direction == 'Up' or direction == 'Right' or direction == 'Down' or direction == 'Left'

class Room(object):
    """
    Room object indicating its neighbouring rooms and possible places for barricades.
    """

    def __init__(self, up_room, right_room, down_room, left_room,
        up_barricade, right_barricade, down_barricade, left_barricade):
        self.up_room          = up_room
        self.right_room       = right_room
        self.down_room        = down_room
        self.left_room        = left_room
        self.up_barricade     = up_barricade
        self.right_barricade  = right_barricade
        self.down_barricade   = down_barricade
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

    def get_barricade_to_room(self, room):
        """
        Returns an index of a barricade separating this and the given room.
        """
        if self.up_room == room:
            return (self.up_barricade, 'Up')
        elif self.right_room == room:
            return (self.right_barricade, 'Right')
        elif self.down_room == room:
            return (self.down_barricade, 'Down')
        elif self.left_room == room:
            return (self.left_barricade, 'Left')
        return (-1, '')

    def get_neighbouring_rooms_and_barricades(self):
        """
        Returns indices of neighbouring rooms and barricades.
        """
        rooms = []
        if self.up_room != -1:
            rooms.append((self.up_room, self.up_barricade))
        if self.right_room != -1:
            rooms.append((self.right_room, self.right_barricade))
        if self.down_room != -1:
            rooms.append((self.down_room, self.down_barricade))
        if self.left_room != -1:
            rooms.append((self.left_room, self.left_barricade))
        return rooms

    def __str__(self):
        return 'Room with {} {} {} {}'.format(self.up_room, self.right_room, self.down_room, self.left_room)

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

class CheckIn(models.Model):
    time = models.DateTimeField(auto_now=True)
    
class Player(models.Model):
    rand_id           = models.PositiveIntegerField()
    name              = models.CharField(max_length=20)
    game              = models.ForeignKey('Game', related_name='players', null=True,
                            on_delete=models.SET_NULL)
    index             = models.PositiveSmallIntegerField(null=True)
    room              = models.PositiveSmallIntegerField(default=3)
    ammo              = models.PositiveSmallIntegerField(default=5)
    carrying_ammo_box = models.BooleanField(default=False)
    alive             = models.BooleanField(default=True)
    score             = models.PositiveSmallIntegerField(default=0)
    checkin           = models.OneToOneField(CheckIn, related_name='player', blank=True, null=True)

    @staticmethod
    def generate_rand_id():
        """
        Generates a random ID for a new player.
        """
        return getrandbits(10)

    @staticmethod
    def clean_up():
        """
        Deletes players not checked-in for 60 seconds or more.
        """
        time = datetime.now() - timedelta(seconds=60)
        count = Player.objects.all().count()
        Player.objects.filter(checkin__time__lte=time).delete()
        count2 = Player.objects.all().count()
        if count != count2:
            print 'DELETED {} PLAYERS'.format(count - count2)

    def update_score(self, action):
        """
        Updates player's score based on the action.
        """
        if action == 'Move':
            delta = 8 + (2 if self.carrying_ammo_box else 0)
        elif action == 'Shoot':
            delta = 15
        elif action == 'Barricade':
            delta = 12
        elif action == 'Ammo':
            delta = 10
        else:
            delta = 8
        self.score = self.score + delta * (1.0 / self.game.players.count())
        self.save()

    def save_score(self):
        """
        Saves the score to the leaderboard.
        """
        LeaderboardEntry(name=self.name, score=self.score).save()

    def timeout_soon(self):
        """
        Returns True if the player is going to timeout in 2 seconds.
        """
        if self.game.turns_played == 0:
            # Timeout after 30 seconds
            timeout_time = self.game.current_player_start + timedelta(seconds=28)
        else:
            # Timeout after 15 seconds
            timeout_time = self.game.current_player_start + timedelta(seconds=13)

        return timeout_time < datetime.now()

    def do_check_in(self):
        """
        Checks-in a player informing the system that the player is still online.
        """
        if self.checkin:
            self.checkin.save()
        if self.game and self.game.master == self:
            self.game.do_check_in()

    def __unicode__(self):
        return self.name

class Bot(models.Model):
    has_played = models.BooleanField(default=False)

    def take_turn(self):
        """
        Takes a turn.
        """
        self.has_played = True
        self.save()

        self.move_snails()
        self.game.check_if_dead_players()

        # 15 groups of snails at most
        if self.game.snails.all().count() < 15:
            if self.game.turns_played < 10:
                # Spawn more snails with 60% probability
                if random() <= 0.6:
                    self.game.spawn_snails(1)
            elif self.game.turns_played < 20:
                # Spawn more snails with 40% probability
                if random() <= 0.4:
                    self.game.spawn_snails(1)
            else:
                # Spawn more snails with 20% probability
                if random() <= 0.2:
                    self.game.spawn_snails(1)

    def move_snails(self):
        """
        Moves one group of snails towards some ghost.
        """
        best_moves = {}

        for snail in self.game.snails.order_by('pk').all():
            # From time to time (5% probability) do a random move
            if random() <= 0.2:
               snail.take_turn(snail.random_move)
               continue

            if snail.room in best_moves:
                # Re-use the best move
                move = best_moves[snail.room]
            else:
                # Calculate and cache the best move
                shortest_path = snail.shortest_path_to_a_ghost()
                move = shortest_path[0] if shortest_path else None
                best_moves[snail.room] = move
            snail.take_turn(move)

class Game(models.Model):
    master               = models.OneToOneField(Player, related_name='mastered_game', null=True)
    bot                  = models.OneToOneField(Bot, related_name='game', null=True)
    status               = models.PositiveSmallIntegerField(default=0) # 0 = not started, 1 = started, 2 = over
    current_player_index = models.PositiveSmallIntegerField(null=True)
    current_player_start = models.DateTimeField(null=True)
    last_player          = models.OneToOneField(Player, related_name='last_game', null=True, on_delete=models.SET_NULL)
    last_action          = models.CharField(max_length=20, null=True)
    last_direction       = models.CharField(max_length=5, null=True)
    ammo_box_room        = models.PositiveSmallIntegerField(default=3)
    ammo_box_in_transit  = models.BooleanField(default=False)
    turns_played         = models.PositiveIntegerField(default=0)
    checkin              = models.OneToOneField(CheckIn, related_name='game', blank=True, null=True)
   
    @staticmethod
    def clean_up():
        """
        Deletes games not checked-in for 60 seconds or more.
        """
        time = datetime.now() - timedelta(seconds=60)
        Player.objects.filter(checkin__time__lte=time).delete()

    @staticmethod
    def get_dict_of_games(player):
        """
        Returns a dictionary of games not joined by the given player
        (PK : string representation).
        """
        # Exclude the game joined by the player
        exclude_pk = player.game.pk if player.game is not None else -1
        return {game.pk : str(game) for game in Game.objects.exclude(pk=exclude_pk)}
    
    def do_check_in(self):
        """
        Checks-in a game informing the system that the game is still on.
        """
        if self.checkin:
            self.checkin.save()

    def start(self):
        """
        Starts the game.
        """
        # Spawn players randomly
        for player in self.get_list_of_players():
            room_no = randint(1, 5)
            player.room = room_no
            player.save()

        self.spawn_snails(1)

        self.current_player_index = 1
        self.current_player_start = datetime.now()
        self.status = 1
        self.save()

        # Initial barricades
        barricade_left = Barricade(game=self, index=0)
        barricade_left.save()
        barricade_right = Barricade(game=self, index=5)
        barricade_right.save()

    def spawn_snails(self, how_many=1):
        """
        Spawns snails randomly.
        """
        left_or_right = randint(0, 1)
        room_no = 0 if left_or_right == 0 else 6

        health = 100 + self.turns_played * 0.2
        snail = Snail(game=self, room=room_no, health=health)
        snail.save()

    def make_turn(self, player, action, direction):
        """
        Makes the turn with the given player.
        """
        if self.current_player_index != player.index:
            print 'NACK'
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
        elif action == 'Shoot':
            if not self.action_shoot(player, direction):
                return
        elif action == 'Reload':
            if not self.action_reload(player):
                return
        else:
            # Action is not supported
            print 'INVALID ACTION {}'.format(action)
            player.delete()
            return

        player.update_score(action)

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

        # Check if the player becomes dead
        snails_in_the_room = self.snails.filter(room=player.room)
        if snails_in_the_room.exists():
            player.alive = False
            player.save_score()
            print 'DEAD'
            self.check_if_game_over()

        # Save the player
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

        if player.carrying_ammo_box:
            # Can't barricade while carrying the ammo box
            print 'CANT BARRICADE WITH AMMO BOX'
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

        if player.carrying_ammo_box:
            # Can't debarricade while carrying the ammo box
            print 'CANT DEBARRICADE WITH AMMO BOX'
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

    def action_shoot(self, player, direction):
        """
        Executes the SHOOT action.
        """
        if not is_valid_direction(direction):
            # Invalid direction
            print 'INVALID DIRECTION'
            player.delete()
            return False

        if player.ammo <= 0:
            # Player has no ammo
            print 'PLAYER HAS NO AMMO'
            player.delete()
            return False

        snails_room = ROOMS[player.room].get_room_in_direction(direction)
        query = self.snails.filter(room=snails_room).order_by('entered_room')
        if query.count() == 0:
            # There are no snails in the neighbouring room to shoot at
            print 'NO SNAILS TO SHOOT AT'
            player.delete()
            return False

        # Shoot at snails
        snail = query[0]
        if snail.health > 20:
            snail.health = snail.health - 20
            snail.save()
        else:
            snail.delete()
        # Decrease ammo
        player.ammo = player.ammo - 1
        player.save()
        return True

    def action_reload(self, player):
        """
        Executes the RELOAD action.
        """
        if self.ammo_box_in_transit or self.ammo_box_room != player.room:
            print 'AMMO BOX NOT AVAILABLE FOR RELOADING'
            player.delete()
            return False

        if player.ammo == 5:
            print 'CANT RELOAD WITH FULL AMMO'
            player.delete()
            return False

        # Reload
        player.ammo = 5
        player.save()
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
        return self.get_list_of_players().values('pk', 'name', 'index', 'room',
            'ammo', 'carrying_ammo_box', 'alive', 'score')

    def get_list_of_barricades(self):
        """
        Returns a list of barricades with their indices and health.
        """
        return self.barricades.values('index', 'health')

    def get_list_of_snails(self):
        """
        Returns a list of snails with their PKs, rooms and health.
        """
        return self.snails.order_by('pk').values('pk', 'room', 'health', 'action', 'direction')

    def get_max_player_index(self):
        """
        Returns the maximum player index in this game.
        """
        return self.players.order_by('-index')[0].index

    def get_ammo_box_info(self):
        """
        Returns the ammo box information.
        """
        return {'room': self.ammo_box_room, 'in_transit': self.ammo_box_in_transit}

    def get_current_player(self):
        """
        Returns the player, whose turn it is.
        """
        if self.current_player_index == 0:
            # Bot
            if not self.bot.has_played:
                self.bot.take_turn()
                self.save() # TODO - why

            # Timeout after 5 seconds
            timeout_time = self.current_player_start + timedelta(seconds=5)

            if timeout_time < datetime.now():
                # Timed out
                self.last_player = None
                self.turns_played = self.turns_played + 1
                return self.change_turns()
            return None
        else:
            # Human player
            try:
                # Try getting the current player
                current_player = self.players.get(index=self.current_player_index)

                if self.turns_played == 0:
                    # The first player gets 30 seconds
                    timeout_time = self.current_player_start + timedelta(seconds=30)
                else:
                    # Timeout after 15 seconds
                    timeout_time = self.current_player_start + timedelta(seconds=15)
            except ObjectDoesNotExist:
                # Current player got removed
                self.last_player = None
                return self.change_turns()

            if timeout_time < datetime.now():
                # Timed out
                self.last_player = current_player
                return self.change_turns()
            return current_player

    def change_turns(self):
        """
        Ensures that it is the next player's turn now. Returns the next player.
        """
        results = self.players.order_by('index').filter(index__gt=self.current_player_index, alive=True)
        if results.exists():
            next_player = results[0]
        else:
            next_player = None

        if next_player:
            self.current_player_index = next_player.index
        else:
            self.current_player_index = 0

        self.current_player_start = datetime.now()
        if self.current_player_index == 0:
            self.bot.has_played = False
            self.bot.save()
        self.save()
        return next_player

    def check_if_dead_players(self):
        """
        Checks if there are any new dead players (in the same room as some snails).
        """
        live_players = self.players.filter(alive=True)
        for player in live_players:
            snails_in_the_room = self.snails.filter(room=player.room)
            if player.alive and snails_in_the_room.exists():
                player.alive = False
                player.save()

                player.save_score()

                print 'DEAD'
                self.check_if_game_over()

    def check_if_game_over(self):
        """
        Checks if the game is over.
        """
        if self.players.filter(alive=True).count() == 0:
            self.status = 2
            self.save()


    def __unicode__(self):
        if self.players.count() == 0:
            # For the case when a game is left in the DB for longer than expected
            return "Noone's game"
        return "{0!s}'s game".format(self.master)

class Barricade(models.Model):
    game   = models.ForeignKey(Game, related_name='barricades')
    index  = models.PositiveIntegerField()
    health = models.PositiveIntegerField(default=100)

    def __unicode__(self):
        return 'Barricade {} with health {}'.format(self.index, self.health)

SNAIL_DAMAGE_RATE = 4.0

class Snail(models.Model):
    game         = models.ForeignKey(Game, related_name='snails')
    room         = models.PositiveSmallIntegerField()
    entered_room = models.DateTimeField(auto_now_add=True)
    health       = models.PositiveIntegerField(default=100)
    action       = models.CharField(max_length=10, default='Spawn')
    direction    = models.CharField(max_length=5, default='')

    def take_turn(self, move):
        # Default values for is something goes wrong
        self.action = ''
        self.direction = ''
        self.save()

        if move is None:
            # No path found
            return

        # Find out if need to go through a barricade
        barricade_index, direction = ROOMS[self.room].get_barricade_to_room(move)
        if barricade_index == -1:
            # No barricade = no room, something's wrong
            return

        # Handle the barricade
        query = self.game.barricades.filter(index=barricade_index)
        if query.exists():
            # There is a barricade
            print 'SNAIL {} ATTACKING {}'.format(self, barricade_index)
            barricade = query.all()[0]
            barricade.health = barricade.health - math.floor(self.health / SNAIL_DAMAGE_RATE)
            if barricade.health <= 0:
                # Barricade destroyed
                barricade.delete()
                print 'BARRICADE GONE'
            else:
                barricade.save()

            self.action = 'Attack'
            self.direction = direction
        else:
            # There is no barricade - can just move
            print 'SNAIL {} MOVING TO {}'.format(self, move)
            self.room = move
            self.entered_room = datetime.now()
            self.action = 'Move'
            self.direction = direction

        # Save the changes
        self.save()

    def shortest_path_to_a_ghost(self):
        """
        Returns the shortest path to some ghost.
        """
        rooms_to_check = []
        heappush(rooms_to_check, (0, 0, self.room, []))

        while len(rooms_to_check) > 0:
            # Get the next room to check
            path_cost, depth, room, path = heappop(rooms_to_check)

            # Limit the depth of the search - genius
            if depth > 5:
                break

            if self.game.players.filter(room=room, alive=True).exists():
                # Found a ghost, return the path
                return path

            # Check neighbouring rooms
            for (next_room, barricade) in ROOMS[room].get_neighbouring_rooms_and_barricades():
                query = self.game.barricades.filter(index=barricade)
                if not query.exists():
                    # No barricade in the way, can check this room
                    turns_needed = 1
                else:
                    # Consider a path through the barricade
                    barricade = query.all()[0]
                    turns_needed = math.ceil((SNAIL_DAMAGE_RATE * barricade.health) / self.health)
                heappush(rooms_to_check, (path_cost + turns_needed, depth + 1, next_room, path + [next_room]))

        # The search failed, try choosing a random movement direction
        return self.random_move()

    def random_move(self):
        """
        Does a random move. Returns an index of a room to move to or None.
        """
        for i in range(10):
            current_room = ROOMS[self.room]
            if random() <= 0.4 and current_room.up_room != -1:
                return [current_room.up_room]
            elif random() <= 0.3 and current_room.right_room != -1 and current_room.right_room != 6:
                return [current_room.right_room]
            elif random() <= 0.2 and current_room.down_room != -1:
                return [current_room.down_room]
            elif random() <= 0.3 and current_room.left_room != -1 and current_room.left_room != 0:
                return [current_room.left_room]

        # Something is really wrong
        return None

    def __unicode__(self):
        return 'Snail in room {} with health {}'.format(self.room, self.health)

class LeaderboardEntry(models.Model):
    name  = models.CharField(max_length=20)
    score = models.PositiveSmallIntegerField()

    @staticmethod
    def entries():
        return LeaderboardEntry.objects.order_by('-score')

    def __unicode__(self):
        return 'Player: {}, score: {}'.format(self.name, self.score)
