# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Game.last_player'
        db.add_column('game_game', 'last_player',
                      self.gf('django.db.models.fields.related.OneToOneField')(related_name='last_game', unique=True, null=True, to=orm['game.Player']),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Game.last_player'
        db.delete_column('game_game', 'last_player_id')


    models = {
        'game.game': {
            'Meta': {'object_name': 'Game'},
            'current_player_index': ('django.db.models.fields.PositiveSmallIntegerField', [], {'null': 'True'}),
            'current_player_start': ('django.db.models.fields.DateTimeField', [], {'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_action': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True'}),
            'last_checked_in': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'last_direction': ('django.db.models.fields.CharField', [], {'max_length': '5', 'null': 'True'}),
            'last_player': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'last_game'", 'unique': 'True', 'null': 'True', 'to': "orm['game.Player']"}),
            'master': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'mastered_game'", 'unique': 'True', 'null': 'True', 'to': "orm['game.Player']"}),
            'status': ('django.db.models.fields.PositiveSmallIntegerField', [], {'default': '0'})
        },
        'game.player': {
            'Meta': {'object_name': 'Player'},
            'game': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'players'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': "orm['game.Game']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'index': ('django.db.models.fields.PositiveSmallIntegerField', [], {'null': 'True'}),
            'last_checked_in': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'rand_id': ('django.db.models.fields.PositiveIntegerField', [], {})
        }
    }

    complete_apps = ['game']