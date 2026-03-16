#!/usr/bin/env bash
set -e

# Run dev server
python manage.py collectstatic --noinput
PYTHONUNBUFFERED=1 python manage.py runserver 0.0.0.0:8000
