# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'CheckIn'
        db.create_table('game_checkin', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('time', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
        ))
        db.send_create_signal('game', ['CheckIn'])

        # Deleting field 'Player.last_checked_in'
        db.delete_column('game_player', 'last_checked_in')

        # Deleting field 'Game.last_checked_in'
        db.delete_column('game_game', 'last_checked_in')


    def backwards(self, orm):
        # Deleting model 'CheckIn'
        db.delete_table('game_checkin')

        # Adding field 'Player.last_checked_in'
        db.add_column('game_player', 'last_checked_in',
                      self.gf('django.db.models.fields.DateTimeField')(auto_now=True, default=0, blank=True),
                      keep_default=False)

        # Adding field 'Game.last_checked_in'
        db.add_column('game_game', 'last_checked_in',
                      self.gf('django.db.models.fields.DateTimeField')(auto_now=True, default=0, blank=True),
                      keep_default=False)


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
            'game': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'players'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': "orm['game.Game']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'index': ('django.db.models.fields.PositiveSmallIntegerField', [], {'null': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'rand_id': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'room': ('django.db.models.fields.PositiveSmallIntegerField', [], {'default': '3'})
        }
    }

    complete_apps = ['game']