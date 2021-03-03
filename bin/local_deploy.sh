#!/usr/bin/env bash
set -e

ROOT=$(dirname "$0")
HELM_DIR="$ROOT/../helm_deploy/cla-frontend/"

kubectl config use-context docker-for-desktop
docker build -t cla_frontend_local "$ROOT/../"

helm upgrade cla-frontend \
  $HELM_DIR \
  --values ${HELM_DIR}/values-dev.yaml \
  --install \
  --force \
  --debug
