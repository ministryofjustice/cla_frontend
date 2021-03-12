#!/usr/bin/env bash
set -e

# This script is only ran when we are locally testing
if [ $STATIC_FILES_BACKEND != "s3" ]
then
    python manage.py collectstatic --noinput
fi

# Run server
uwsgi --ini /home/app/docker/cla_frontend.ini
