import os
import requests

asset_locations = {
    'favicon.ico': 'https://presalytics.io/static/favicon.ico',
    'transparent_logo.png': 'https://presalytics.io/filer/canonical/1588655780/176/',
    'orange_icon.png': 'https://presalytics.io/filer/canonical/1588695437/184/',
    'blue_background.png': 'https://presalytics.io/filer/canonical/1588099829/174/'
}

assets_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "src", "assets")

for fname, url in asset_locations.items():
    r = requests.get(url)

    target_path = os.path.join(assets_dir, fname)

    if os.path.exists(target_path):
        os.remove(target_path)

    with open(target_path, 'wb+') as f:
        f.write(r.content)

    del(r)