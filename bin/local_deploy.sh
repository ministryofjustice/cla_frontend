#!/usr/bin/env bash
set -e

BIN_DIR=$(dirname "$0")
cd "$BIN_DIR/../"
HELM_DIR="helm_deploy/cla-frontend/"

kubectl config use-context docker-desktop
docker build -t cla_frontend_local .
docker build -t cla_frontend_socket_server_local . -f Dockerfile.socket-server

helm upgrade cla-frontend \
  $HELM_DIR \
  --values ${HELM_DIR}/values-dev.yaml \
  --install \
  --force \
  --debug
