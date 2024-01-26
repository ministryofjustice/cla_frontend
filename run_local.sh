#!/bin/bash
export DOCKER_BUILDKIT=1
export ENVIRONMENT=${1:-development}
echo "Running environment: $ENVIRONMENT"
docker compose down --remove-orphans

CLA_BACKEND_CID=$(docker ps -q -f status=running -f ancestor=cla_backend-cla_backend)

# If cla_backend_db doesn't exist then we want to start cla_backend
if [ "$CLA_BACKEND_CID" == "" ];
then
    echo "Starting multi container app"
    docker compose -f docker-compose.yml up --build -d

    # As we have started the database ourselves we need to run the migrations
    docker exec cla_backend bin/create_db.sh

    CLA_BACKEND_CID=$(docker ps -q -f status=running -f ancestor=cla_frontend-cla_backend)
else
    echo "Starting cla_frontend as standalone"
    docker compose -f docker-compose-standalone.yml up --build -d
fi

# cla_backend is not valid hostname so we rename it to clabackend, this allows us to connect to the backend
docker container rename $CLA_BACKEND_CID clabackend

CLA_FRONTEND_CID=$(docker ps -q -f status=running -f name=cla_frontend-cla_frontend)
if [ "$CLA_FRONTEND_CID" != "" ];
then
    # Collects the frontend js and css assets
    docker exec $CLA_FRONTEND_CID python manage.py collectstatic --noinput

    # Add cla_frontend to the cla_backend network
    docker network connect cla_backend_default $CLA_FRONTEND_CID
else
    echo "ERROR: Could not find a running cla_frontend container"
fi

# Removes the exited start applications container
START_APPLICATIONS_CID=$(docker ps -a -q -f ancestor=jwilder/dockerize)
if [ "$START_APPLICATIONS_CID" != "" ];
then
    docker rm $START_APPLICATIONS_CID
fi