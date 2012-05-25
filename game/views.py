from django.http import HttpResponse

def index(request):
    return HttpResponse('I\'m a pretty butterfly')
