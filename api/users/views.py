import logging
import json
from django.core.exceptions import ImproperlyConfigured
from django.http.response import HttpResponseNotFound
from django.shortcuts import render
from django.views.generic import TemplateView, View
from django.conf import settings
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseForbidden
from api.permissions import PresalyticsViewerPermission
from api.services.website import WebsiteService
from user_sessions.models import Session


logger = logging.getLogger(__name__)


class SessionView(TemplateView):

    template_name = 'session.html'

    def get_context_data(self, **kwargs):

        context = super().get_context_data(**kwargs)
        context['target_origin'] = settings.FRONTEND_BASE_URL
        return context

    def post(self, request, **kwargs):
        try:
            if request.user.is_authenticated:
                data = json.loads(request.body)
                for key, val in data.items():
                    request.session[key] = val
                request.session.save()
                return HttpResponse(status=204)
            else:
                return JsonResponse({'message': 'No matching user session found.'}, status=400)
        except Exception as ex:
            logger.exception(ex)
            return JsonResponse({'message': 'The data sent to the server could not be parsed.'}, status=400)


    def delete(self, request, **kwargs):
        if request.user.is_authenticated:
            try:
                request.user.session_set.delete()
            except Exception:
                pass
        else:
            try:
                request.session.delete()
            except Exception:
                pass
        return HttpResponse(status=204)


class UserRelationshipView(View):
    
    def get(self, request, *args, **kwargs):
        related_users = set(request.user.get_related_users())
        rels = {
            "relationships": [x.to_dict() for x in related_users]
        }
        return JsonResponse(rels)


class UserInfoView(View):

    def get(self, request, *args, **kwargs):
        search_user_id = kwargs.get("id", None)
        if search_user_id:
            user_id = str(search_user_id)
            related_users = set(request.user.get_related_users())
            allowed_users = [str(x.related_user_id) for x in related_users]
            allowed_users.append(str(request.user.id))
            if user_id in allowed_users:
                web = WebsiteService()
                try:
                    user_info = web.user(user_id)
                except ValueError:
                    return HttpResponseNotFound()
                except Exception as ex:
                    logger.exception(ex)
                    raise ImproperlyConfigured
                return JsonResponse(user_info)
            else:
                return HttpResponseForbidden()

        else:
            return HttpResponseBadRequest("Invlalid user Id")
        

        
