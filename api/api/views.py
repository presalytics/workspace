from django.shortcuts import redirect, render
from django.urls import reverse
from django.http import HttpResponseNotAllowed


def home(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            return render(request, 'index.html', context={})
        else:
            return redirect(reverse('users:login'), kwargs={'current_app': 'users'})
    return HttpResponseNotAllowed(permitted_methods='GET')
