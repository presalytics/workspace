import base64
import logging
import presalytics
import presalytics.story
import presalytics.story.components
from django.views import View
from django.http import Http404, HttpResponse
from api.services.redis import RedisWrapper



logger = logging.getLogger(__name__)


class NonceCacheView(View):
    def get(self, request, nonce):
        from cache.tasks import cache_key
        key = cache_key(request.user.id, nonce)
        r = RedisWrapper.get_redis()
        encoded = r.get(key)
        if not encoded:
            return Http404()
        subdocument = base64.b64decode(encoded)
        return HttpResponse(subdocument, status=200)

    def post(self, request, nonce):
        from cache.tasks import to_cache
        to_cache.apply_async((request.post('subdocument'), nonce, str(request.user.id)), queue='workspace')




