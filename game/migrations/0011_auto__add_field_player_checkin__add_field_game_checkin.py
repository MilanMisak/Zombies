# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Player.checkin'
        db.add_column('game_player', 'checkin',
                      self.gf('django.db.models.fields.related.OneToOneField')(blank=True, related_name='player', unique=True, null=True, to=orm['game.CheckIn']),
                      keep_default=False)

        # Adding field 'Game.checkin'
        db.add_column('game_game', 'checkin',
                      self.gf('django.db.models.fields.related.OneToOneField')(blank=True, related_name='game', unique=True, null=True, to=orm['game.CheckIn']),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Player.checkin'
        db.delete_column('game_player', 'checkin_id')

        # Deleting field 'Game.checkin'
        db.delete_column('game_game', 'checkin_id')


    models = {
        'game.barricade': {
            'Meta': {'object_name': 'Barricade'},
            'game': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'barricades'", 'to': "orm['game.Game']"}),
            'health': ('django.db.models.fields.PositiveIntegerField', [], {'default': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'index': ('django.db.models.fields.PositiveIntegerField', [], {})
        },
        'game.checkin': {
            'Meta': {'object_name': 'CheckIn'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'time': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        },
        'game.game': {
            'Meta': {'object_name': 'Game'},
            'ammo_box_in_transit': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'ammo_box_room': ('django.db.models.fields.PositiveSmallIntegerField', [], {'default': '3'}),
            'checkin': ('django.db.models.fields.related.OneToOneField', [], {'blank': 'True', 'related_name': "'game'", 'unique': 'True', 'null': 'True', 'to': "orm['game.CheckIn']"}),
            'current_player_index': ('django.db.models.fields.PositiveSmallIntegerField', [], {'null': 'True'}),
            'current_player_start': ('django.db.models.fields.DateTimeField', [], {'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_action': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True'}),
            'last_direction': ('django.db.models.fields.CharField', [], {'max_length': '5', 'null': 'True'}),
            'last_player': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'last_game'", 'unique': 'True', 'null': 'True', 'to': "orm['game.Player']"}),
            'master': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'mastered_game'", 'unique': 'True', 'null': 'True', 'to': "orm['game.Player']"}),
            'status': ('django.db.models.fields.PositiveSmallIntegerField', [], {'default': '0'}),
            'turns_played': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'})
        },
        'game.player': {
            'Meta': {'object_name': 'Player'},
            'ammo': ('django.db.models.fields.PositiveSmallIntegerField', [], {'default': '5'}),
            'carrying_ammo_box': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'checkin': ('django.db.models.fields.related.OneToOneField', [], {'blank': 'True', 'related_name': "'player'", 'unique': 'True', 'null': 'True', 'to': "orm['game.CheckIn']"}),
            'game': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'players'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': "orm['game.Game']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'index': ('django.db.models.fields.PositiveSmallIntegerField', [], {'null': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'rand_id': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'room': ('django.db.models.fields.PositiveSmallIntegerField', [], {'default': '3'})
        }
    }

    complete_apps = ['game']