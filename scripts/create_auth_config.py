import os
import json
from environs import Env


env = Env()
env.read_env()

auth0_config = {
    'domain': os.environ['AUTH0_DOMAIN'],
    'clientId':  os.environ['AUTH0_CLIENT_ID'],
    'redirectUri': os.environ['AUTH0_REDIRECT_URI']
}

fpath = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'src', 'auth_config.json')

if os.path.exists(fpath):
    os.remove(fpath)


with open(fpath, 'w') as f:
    json.dump(auth0_config, f)
