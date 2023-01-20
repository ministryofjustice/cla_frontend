#!/bin/bash
export DOCKER_BUILDKIT=1
export ENVIRONMENT=${1:-development}
#export UNIT_TEST=${2:-""}
echo "running environment $ENVIRONMENT"
docker-compose down --remove-orphans
# todo work out what tests need to be run and how by looking at circleci configs
#if [ $ENVIRONMENT = "test" ]; then
#  export DJANGO_SETTINGS=cla_backend.settings.circle
#  docker-compose build cla_frontend --build-arg specific_test_input=$UNIT_TEST
#  docker-compose run cla_frontend
#else
  docker-compose build cla_frontend
  docker-compose run start_applications
#   todo work out why this line fails - same thing works in end to end tests
#  docker-compose exec cla_backend bin/create_db.sh
#fi
