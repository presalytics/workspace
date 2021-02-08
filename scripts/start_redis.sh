set -xv

docker stop redis

docker rm redis

docker run -p 6379:6379 --name redis redis redis-server --requirepass $REDIS_PASSWORD