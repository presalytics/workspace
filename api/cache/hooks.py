import base64


def cache_hook(subdocument, nonce):
    from cache.tasks import to_cache
    from api.middleware import get_request
    user = get_request().user
    encoded = base64.b64encode(subdocument.encode('utf-8')).decode('utf-8')
    to_cache.apply_async((encoded, nonce, str(user.id)), queue='workspace')
    return True
