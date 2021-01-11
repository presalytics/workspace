import logging
from django.shortcuts import render
from django.views.generic import TemplateView, View
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest, HttpResponseRedirect
from .models import PresaltyicsNativeDeviceOidc


logger = logging.getLogger(__name__)


class LoginView(TemplateView):
    template = 'login.html'


class DeviceCodeView(View):

    def get(self, request, *args, **kwargs):
        try:
            token = request.session.get('token', None)
            login_failed = request.session.get('authorization_failed', False)
            forbidden = request.session.get('authorization_forbidden', False)
            timeout = request.session.get('authorization_timeout', False)
            if token:
                return HttpResponseRedirect("/")  # User has logged in
            elif login_failed:
                return HttpResponse(status=401)  # User supplied invalid credentials
            elif forbidden:
                return HttpResponse(status=403)  # User account does not have access to workspace / agent
            elif timeout:
                return HttpResponse(status=419)  # Authentication failed due to user failuire to login in time window
            else:
                return HttpResponse(status=100)  # waiting for user to complete authorization in with login service (no error, just continue polling)
        except Exception as ex:
            logger.exception(ex)
            return HttpResponseBadRequest("The Presalytics agent could not understand your request.  Please try again.")

    def post(self, request, *args, **kwargs):
        try:
            oidc = PresaltyicsNativeDeviceOidc()
            device_code_response = oidc.get_device_code()
            oidc.handle_device_code_response(device_code_response)
            user_data = {
                "device_code": device_code_response["user_code"],
                "url": device_code_response["login_url"]
            }
            request.session["device_code"] = device_code_response["user_code"]
            return JsonResponse(user_data, status=200)
        except Exception as ex:
            logger.exception(ex)
            return HttpResponseBadRequest("Login Failuire. The Presalytics agent could not understand your request.")

