#!/usr/bin/env bash
set -e

ROOT=$(dirname "$0")
HELM_DIR="$ROOT/../helm_deploy/cla-frontend/"

kubectl config use-context docker-desktop
docker build -t cla_frontend_local "$ROOT/../"
docker build -t cla_frontend_socket_server_local "$ROOT/../" -f Dockerfile.socket-server

helm upgrade cla-frontend \
  $HELM_DIR \
  --values ${HELM_DIR}/values-dev.yaml \
  --install \
  --force \
  --debug
