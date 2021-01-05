from django.shortcuts import redirect, render

def index(request):
    if request.user.is_authenicated:
        return redirect()
        
    else:
        return render(request, 'index.html', context={})