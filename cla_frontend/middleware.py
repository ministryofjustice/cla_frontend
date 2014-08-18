import hashlib
import json
import os

from django.conf import settings
from django.http import HttpRequest, HttpResponse


def serialize_request(request):
    return json.dumps({
        'method': request.method,
        'uri': request.get_full_path()
    })


def serialize_response(response):
    return json.dumps({
        'body': response.content,
        'headers': response._headers,
        'status': {
            'code': response.status_code,
            'message': response.reason_phrase
        }
    })


def unserialize_response(response_json):
    attrs = json.loads(response_json)
    response = HttpResponse(
        content_type=attrs['headers']['content-type'][1],
        status=attrs['status']['code'],
        reason=attrs['status']['message'])
    response.status_code = attrs['status']['code']
    #if response.status_code != 304:
    response.write(attrs['body'])
    return response


def request_hash(request):
    _hash = hashlib.sha1()
    _hash.update(serialize_request(request))
    return _hash.hexdigest()


def file_not_found(e):
    return e.errno == 2


class ResponseCache(object):

    def __init__(self, cache_dir=None):
        if not cache_dir:
            cache_dir = os.path.join(os.getcwd(), 'response_cache')
        self.cache_dir = cache_dir

    def __contains__(self, request):
        return os.path.isfile(self._cache_filename(request))

    def _cache_filename(self, request):
        filename = '{method}.{path}.{hash}'.format(
            method=request.method,
            path=request.get_full_path().replace('/', '_'),
            hash=request_hash(request)[:7])
        return os.path.join(self.cache_dir, filename)

    def __getitem__(self, request):
        try:
            return self._load_response(request)
        except IOError as e:
            if file_not_found(e):
                return None
            raise e

    def _load_response(self, request):
        with open(self._cache_filename(request), 'r') as f:
            return unserialize_response(json.load(f))

    def __setitem__(self, request, response):
        with open(self._cache_filename(request), 'w') as f:
            json.dump(serialize_response(response), f)
        return response


response_cache = ResponseCache(settings.RESPONSE_CACHING_MIDDLEWARE.get('cache_dir'))


class CachedResponse(object):

    def __init__(self, request):
        self.request = request
        self._response = None

    @classmethod
    def exists_for(cls, request):
        return request in response_cache

    def record(self, response):
        response_cache[self.request] = response

    @property
    def response(self):
        if not self._response and CachedResponse.exists_for(self.request):
            cached = response_cache[self.request]
            if not cached:
                return None
            self._response = cached
        return self._response

    def __setattr__(self, attr, value):
        if attr in ['request', '_response']:
            self.__dict__[attr] = value
        else:
            setattr(self.response, attr, value)

    def __setitem__(self, item, value):
        self.response[item] = value

    def __getattr__(self, attr):
        return getattr(self.response, attr)

    def __getitem__(self, item):
        return self.response[item]

    def __contains__(self, header):
        return self.response.__contains__(header)

    def __iter__(self):
        return iter(self.response._container)


class ResponseCachingMiddleware(object):

    def process_request(self, request):
        if CachedResponse.exists_for(request):
            return CachedResponse(request)

    def process_response(self, request, response):
        if isinstance(response, CachedResponse):
            return response.response
        if not response.streaming:
            CachedResponse(request).record(response)
        return response
