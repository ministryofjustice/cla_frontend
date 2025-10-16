#!/bin/bash

# This runs cla_frontend as a standalone container
# In order for the application to work as expected cla_backend should be run as an independant docker application
# If you want to run the application as a multi-container app please run run_local.sh

export DOCKER_BUILDKIT=1
export ENVIRONMENT=${1:-development}
export COMPOSE_PROFILES=backend

echo "Running environment: $ENVIRONMENT"
docker compose down --remove-orphans

unset COMPOSE_PROFILES

echo "Starting cla_frontend as standalone"
docker compose up -d

CLA_FRONTEND_CID=$(docker ps -q -f status=running -f name=cla-frontend-cla_frontend)
if [ "$CLA_FRONTEND_CID" == "" ];
then
    echo "ERROR: Could not find a running cla_frontend container"
    exit 1
fi

# Collects the frontend js and css assets
docker exec -d $CLA_FRONTEND_CID python manage.py collectstatic --noinput