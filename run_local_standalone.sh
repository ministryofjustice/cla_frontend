#!/bin/bash

# This runs cla_frontend as a standalone container
# In order for the application to work as expected cla_backend should be run as an independant docker application
# If you want to run the application as a multi-container app please run run_local.sh

export DOCKER_BUILDKIT=1
export ENVIRONMENT=${1:-development}
export BACKEND_BASE_URI="http://host.docker.internal:8010"

echo "Running environment: $ENVIRONMENT"
docker compose down --remove-orphans

echo "Starting cla_frontend as standalone"
docker compose -f docker-compose-standalone.yml up --build -d

CLA_FRONTEND_CID=$(docker ps -q -f status=running -f name=cla_frontend-cla_frontend)
if [ "$CLA_FRONTEND_CID" == "" ];
then
    echo "ERROR: Could not find a running cla_frontend container"
    exit 1
fi

# Collects the frontend js and css assets
docker exec $CLA_FRONTEND_CID python manage.py collectstatic --noinput