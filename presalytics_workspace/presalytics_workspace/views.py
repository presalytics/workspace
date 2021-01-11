from django.shortcuts import redirect, render
from django.http import HttpResponseNotAllowed


def home(request):
    if request.method == 'GET':
        if request.user.is_authenicated:
            return render(request, 'index.html', context={})
        else:
            return redirect('users:login')
    return HttpResponseNotAllowed()
        