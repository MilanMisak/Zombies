# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Player'
        db.create_table('game_player', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('rand_id', self.gf('django.db.models.fields.PositiveIntegerField')()),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('game', self.gf('django.db.models.fields.related.ForeignKey')(related_name='players', null=True, on_delete=models.SET_NULL, to=orm['game.Game'])),
            ('index', self.gf('django.db.models.fields.PositiveSmallIntegerField')(null=True)),
            ('last_checked_in', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
        ))
        db.send_create_signal('game', ['Player'])

        # Adding model 'Game'
        db.create_table('game_game', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('master', self.gf('django.db.models.fields.related.OneToOneField')(related_name='mastered_game', unique=True, null=True, to=orm['game.Player'])),
            ('status', self.gf('django.db.models.fields.PositiveSmallIntegerField')(default=0)),
            ('current_player_index', self.gf('django.db.models.fields.PositiveSmallIntegerField')(null=True)),
            ('current_player_start', self.gf('django.db.models.fields.DateTimeField')(null=True)),
            ('last_checked_in', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
        ))
        db.send_create_signal('game', ['Game'])


    def backwards(self, orm):
        # Deleting model 'Player'
        db.delete_table('game_player')

        # Deleting model 'Game'
        db.delete_table('game_game')


    models = {
        'game.game': {
            'Meta': {'object_name': 'Game'},
            'current_player_index': ('django.db.models.fields.PositiveSmallIntegerField', [], {'null': 'True'}),
            'current_player_start': ('django.db.models.fields.DateTimeField', [], {'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_checked_in': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
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