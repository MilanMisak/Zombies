from django.conf.urls import patterns, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = patterns('game.views',
    url(r'^$',
        'index',
    ),
    url(r'^game$',
        'game',
    ),
)
urlpatterns += staticfiles_urlpatterns()
