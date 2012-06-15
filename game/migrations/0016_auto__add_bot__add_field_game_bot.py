# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Bot'
        db.create_table('game_bot', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('has_played', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal('game', ['Bot'])

        # Adding field 'Game.bot'
        db.add_column('game_game', 'bot',
                      self.gf('django.db.models.fields.related.OneToOneField')(related_name='game', unique=True, null=True, to=orm['game.Bot']),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting model 'Bot'
        db.delete_table('game_bot')

        # Deleting field 'Game.bot'
        db.delete_column('game_game', 'bot_id')


    models = {
        'game.barricade': {
            'Meta': {'object_name': 'Barricade'},
            'game': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'barricades'", 'to': "orm['game.Game']"}),
            'health': ('django.db.models.fields.PositiveIntegerField', [], {'default': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'index': ('django.db.models.fields.PositiveIntegerField', [], {})
        },
        'game.bot': {
            'Meta': {'object_name': 'Bot'},
            'has_played': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
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
            'bot': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'game'", 'unique': 'True', 'null': 'True', 'to': "orm['game.Bot']"}),
            'bot_played': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'checkin': ('django.db.models.fields.related.OneToOneField', [], {'blank': 'True', 'related_name': "'game'", 'unique': 'True', 'null': 'True', 'to': "orm['game.CheckIn']"}),
            'current_player_index': ('django.db.models.fields.PositiveSmallIntegerField', [], {'null': 'True'}),
            'current_player_start': ('django.db.models.fields.DateTimeField', [], {'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_action': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True'}),
            'last_direction': ('django.db.models.fields.CharField', [], {'max_length': '5', 'null': 'True'}),
            'last_player': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'last_game'", 'unique': 'True', 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': "orm['game.Player']"}),
            'master': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'mastered_game'", 'unique': 'True', 'null': 'True', 'to': "orm['game.Player']"}),
            'status': ('django.db.models.fields.PositiveSmallIntegerField', [], {'default': '0'}),
            'turns_played': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'})
        },
        'game.player': {
            'Meta': {'object_name': 'Player'},
            'ammo': ('django.db.models.fields.PositiveSmallIntegerField', [], {'default': '5'}),
            'bot': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'carrying_ammo_box': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'checkin': ('django.db.models.fields.related.OneToOneField', [], {'blank': 'True', 'related_name': "'player'", 'unique': 'True', 'null': 'True', 'to': "orm['game.CheckIn']"}),
            'game': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'players'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': "orm['game.Game']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'index': ('django.db.models.fields.PositiveSmallIntegerField', [], {'null': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'rand_id': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'room': ('django.db.models.fields.PositiveSmallIntegerField', [], {'default': '3'})
        },
        'game.snail': {
            'Meta': {'object_name': 'Snail'},
            'game': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'snails'", 'to': "orm['game.Game']"}),
            'health': ('django.db.models.fields.PositiveIntegerField', [], {'default': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'room': ('django.db.models.fields.PositiveSmallIntegerField', [], {})
        }
    }

    complete_apps = ['game']