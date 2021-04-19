import urllib.parse
import logging
import presalytics
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from .base import ServiceBase


logger = logging.getLogger(__name__)


class WebsiteService(ServiceBase):

    API_BASE_URL = presalytics.settings.HOST_SITE

    class ServiceEndpoints:
        GET_LEAD = "/site-analytics/get-lead/"
        LOGIN = "/login/auth0"
        SIGNUP = "/signup/"
        STORY_VIEW = "/story/view/{story_id}/"
        STORY_MANAGE = "/story/manage/{story_id}/"
        STORY_HOME = "/story/"
        STORY_REMOVE_INACTIVE = "/story/remove-inactive-collaborator/{story_id}/"
        LEAD_API = "/site-analytics/lead/{lead_id}/"
        USER_API = "/user/{user_id}/"
        SESSION_API = "/user/session-token/"
        USER_BY_EMAIL = "/user/user_by_email"
        TRACK_CONVERSATION = "/user/track-conversation"

    def __init__(self, *args, **kwargs):
        super(WebsiteService, self).__init__(base_url=presalytics.settings.BROWSER_API_HOST_SITE, *args, **kwargs)

    def get_token(self):
        scopes = "website website:read-users website:manage-users"
        key = settings.CLIENT_CREDENTIALS_CACHE_KEY + "-website"
        return super().get_token(scopes, key=key)

    def append_query(self, url, query):
        query_string = urllib.parse.urlencode(query)
        url = url + "?" + query_string
        return url

    def make_url(self, service_endpoint, query=None, prefix_base=True):
        if prefix_base:
            url = self.base_url + service_endpoint
        else:
            url = "/" + service_endpoint
        if query:
            url = self.append_query(url, query)
        return url

    def login_url(self, query=None, prefix_base=True):
        return self.make_url(self.ServiceEndpoints.LOGIN, query=query, prefix_base=prefix_base)

    def signup_url(self, query=None, prefix_base=True):
        return self.make_url(self.ServiceEndpoints.SIGNUP, query=query, prefix_base=prefix_base)

    def story_view_url(self, story_id, query=None, prefix_base=True):
        return self.make_url(self.ServiceEndpoints.STORY_VIEW.format(story_id=story_id), query=query, prefix_base=prefix_base)

    def story_home_url(self, query=None, prefix_base=True):
        return self.make_url(self.ServiceEndpoints.STORY_HOME, query=query, prefix_base=prefix_base)

    def story_remove_inactive_user(self, story_id, query):
        url = self.base_url + self.ServiceEndpoints.STORY_REMOVE_INACTIVE.format(story_id=story_id)
        url = self.append_query(url, query)
        return url

    def get_lead(self, email_address):
        resp = self.post(self.ServiceEndpoints.GET_LEAD, {"email": email_address}, base_url=self.API_BASE_URL)
        if resp.status_code == 200:
            lead_data = resp.json()
            if getattr(lead_data, "conversion_user_id", None):
                return {"user_id": lead_data.get("conversion_user_id")}
            else:
                return {"lead_id": lead_data.get("id")}
        else:
            raise ImproperlyConfigured("An error occured With the Lead service.  Presalytics.io may be down.")

    def lead(self, lead_id):
        resp = self.get(self.ServiceEndpoints.LEAD_API.format(lead_id=lead_id), base_url=self.API_BASE_URL)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 404:
            raise ImproperlyConfigured("Lead {} could not be found on the wesite service".format(lead_id))
        else:
            logger.error(msg=resp.text)
            raise ImproperlyConfigured("An error occured With the Lead service.  Presalytics.io may be down.")

    def user(self, user_id):
        resp = self.get(self.ServiceEndpoints.USER_API.format(user_id=user_id), base_url=self.API_BASE_URL)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 404:
            raise ValueError("User {} could not be found on the wesite service".format(user_id))
        else:
            raise ImproperlyConfigured("An error occured With the User service.  Presalytics.io may be down.")

    def get_user_by_email(self, email):
        resp = self.post(self.ServiceEndpoints.USER_BY_EMAIL, {"email": email}, base_url=self.API_BASE_URL)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 404:
            raise ImproperlyConfigured("User with email {} could not be found on the wesite service".format(email))
        else:
            raise ImproperlyConfigured("An error occured With the User service.  Presalytics.io may be down.")

    def is_active_user(self, user_id):
        try:
            user = self.user(user_id)
            if user:
                return True
        except Exception:
            pass
        return False

    def get_user_access_token(self, session_token):
        data = {"session_id": session_token}
        resp = self.post(self.ServiceEndpoints.SESSION_API, data)

        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 404:
            raise ImproperlyConfigured("User could not be found on the website service")
        else:
            raise ImproperlyConfigured("An error occured With the User service.  Presalytics.io may be down.")
