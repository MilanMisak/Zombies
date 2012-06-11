from django.conf.urls import patterns, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = patterns('game.views',
    url(r'^$',
        'index',
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
)
urlpatterns += staticfiles_urlpatterns()
