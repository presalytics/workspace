import os
import requests

urls = [
    "https://presalytics.io/static/scss/_variables.scss"
]

for url in urls:
    r = requests.get(url)

    fname = url.split("/")[-1]

    path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "presalytics_workspace", "static", "scss", fname)

    with open(path, "wb+") as f:
        f.write(r.content)



    