#!/bin/bash
export DOCKER_BUILDKIT=1
export ENVIRONMENT=${1:-development}
echo "running environment $ENVIRONMENT"
docker-compose down --remove-orphans
docker-compose up --build

# This script is only ran when we are locally testing
if [ $STATIC_FILES_BACKEND != "s3" ]
then
    docker-compose exec cla_frontend manage.py collectstatic --noinput
    
    # This command is run post install when the application is deployed
    docker-compose exec cla_backend bin/create_db.sh
fi
