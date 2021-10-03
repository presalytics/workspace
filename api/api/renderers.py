from djangorestframework_camel_case.render import CamelCaseJSONRenderer
from rest_framework.utils.encoders import JSONEncoder
from presalytics.story.outline import StoryOutline, OutlineEncoder


class PresalyticsEncoder(OutlineEncoder, JSONEncoder):

    def default(self, obj):
        try:
            return OutlineEncoder.default(self, obj)
        except TypeError:
            return JSONEncoder.default(self, obj)


class PresalyticsJSONRenderer(CamelCaseJSONRenderer):
    encoder_class = PresalyticsEncoder