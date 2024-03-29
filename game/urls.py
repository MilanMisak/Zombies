from django.conf.urls import patterns, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = patterns('game.views',
    url(r'^$',
        'index',
        name='index'
    ),
    url(r'^create-game$',
        'create_game',
    ),
    url(r'^join-game$',
        'join_game',
    ),
    url(r'^start-game$',
        'start_game',
        name='start_game'
    ),
    url(r'^game$',
        'game',
    ),
    url(r'^ajax-join-game/(\d+)$',
        'ajax_join_game',
    ),
    url(r'^ajax-game-info$',
        'ajax_game_info',
    ),
    url(r'^ajax-games$',
        'ajax_games',
    ),
    url(r'^ajax-game-state$',
        'ajax_game_state',
    ),
    url(r'^ajax-make-turn/(?P<action>\w+)/(?P<direction>\w*)$',
        'ajax_make_turn',
    ),
    url(r'^leaderboard$',
        'leaderboard',
        name='leaderboard'
    ),
)
urlpatterns += staticfiles_urlpatterns()
