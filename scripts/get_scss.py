import os
import shutil
import requests

urls = [
    "https://presalytics.io/static/scss/_variables.scss",
    "https://presalytics.io/static/scss/bootstrap-retheme.scss",
    "https://presalytics.io/static/scss/_global.scss",
    "https://presalytics.io/static/scss/_icons.scss",
    "https://presalytics.io/static/scss/_mixins.scss",
    "https://presalytics.io/static/scss/_page-container.scss",
    "https://presalytics.io/static/scss/_footer.scss",
    "https://presalytics.io/static/scss/_code.scss",
]

for url in urls:
    r = requests.get(url)

    fname = url.split("/")[-1]

    path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "src", "scss", fname)

    if os.path.exists(path):
        os.remove(path)

    with open(path, "wb+") as f:
        f.write(r.content)

bootstrap_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'node_modules', 'bootstrap')
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'api', 'static')
bootstrap_target = os.path.join(static_dir, 'bootstrap')

if os.path.exists(bootstrap_target):
    shutil.rmtree(bootstrap_target)

shutil.copytree(bootstrap_dir, bootstrap_target)


