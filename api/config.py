import os

PRESALYTICS = {
    "CLIENT_ID": os.environ['CLIENT_ID'],
    "HOSTS": {
        "STORY": os.getenv('STORY_HOST', "http://story.api.svc.cluster.local/story"),
        "SITE": os.getenv('SITE_HOST', "https://presalytics.io"),
        "OOXML_AUTOMATION": os.getenv('OOXML_AUTOMATION_HOST', "http://ooxml-automation.api.svc.cluster.local/ooxml-automation")
    },
    "BROWSER_API_HOST": {
        'STORY': os.getenv('BROWSER_API_HOST_STORY', 'https://api.presalytics.io/story'),
        'OOXML_AUTOMATION': os.getenv('BROWSER_API_HOST_OOXML_AUTOMATION', 'https://api.presalytics.io/story'),
        'SITE': os.getenv('BROWSER_API_HOST_SITE', 'https://api.presalytics.io/story')
    },
    "USE_LOGGER": False,
    "CACHE_TOKENS": False
}