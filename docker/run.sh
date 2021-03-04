#!/usr/bin/env bash
set -e

# Run server
uwsgi --ini /home/app/docker/cla_frontend.ini
