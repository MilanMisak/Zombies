from django.conf.urls import patterns, url

urlpatterns = patterns('game.views',
    url(r'^$',
        'index',
    ),
    url(r'^game$',
        'game',
    ),
)
