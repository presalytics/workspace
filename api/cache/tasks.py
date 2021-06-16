import base64
import cache
from celery import shared_task
from api.services.redis import RedisWrapper


def cache_key(user_id, nonce):
    return str(user_id) + str(nonce)

@shared_task
def to_cache(encoded, nonce, user_id):
    r = RedisWrapper.get_redis()
    key = cache_key(user_id, nonce)
    r.put(key, encoded)