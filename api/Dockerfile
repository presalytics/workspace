FROM tiangolo/uwsgi-nginx:python3.6

COPY . /app/api

ADD uwsgi.ini .

WORKDIR /app/api

RUN apt-get update \
    && apt-get install -y ca-certificates \
    && update-ca-certificates


RUN pip3 install --upgrade uwsgi \
    && apt-get install -y --no-install-recommends libssl-dev \
    && pip3 install -r requirements.txt \
    && mkdir /var/log/uwsgi \
    && touch /tmp/uwsgi.sock

