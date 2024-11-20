#!/bin/bash

# This runs cla_frontend as a multi-container application
# This will create the cla_backend containers as defined by the cla_backend application 
# at ../cla_backend, if you do not have the repository in this location it will be downloaded here.

export DOCKER_BUILDKIT=1
export ENVIRONMENT=${1:-development}
export COMPOSE_PROFILES=backend

if [ ! -d "../cla_backend" ]; then
  echo "cla_backend does not exist at ../cla_backend, clonining it."
  git clone https://github.com/ministryofjustice/cla_backend ../cla_backend
fi

echo "Running environment: $ENVIRONMENT"
docker compose down --remove-orphans

echo "Starting multi-container app"
docker compose up -d

# As we have started the database ourselves we need to run the migrations
docker exec -d cla_backend bin/create_db.sh

CLA_FRONTEND_CID=$(docker ps -q -f status=running -f name=cla-frontend-cla_frontend)
if [ "$CLA_FRONTEND_CID" == "" ];
then
    echo "ERROR: Could not find a running cla_frontend container"
    exit 1
fi

# Collects the frontend js and css assets
docker exec -d $CLA_FRONTEND_CID python manage.py collectstatic --noinput