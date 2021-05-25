#!/usr/bin/env bash
set -e

ROOT=$(dirname "$0")
HELM_DIR="$ROOT/../helm_deploy/cla-frontend/"
VALUES="values-uat.yaml"

helm upgrade $RELEASE_NAME \
  $HELM_DIR \
  --namespace=${KUBE_ENV_UAT_NAMESPACE} \
  --values "${HELM_DIR}/$VALUES" \
  --set fullnameOverride=$RELEASE_NAME \
  --set environment=$RELEASE_NAME \
  --set host=$RELEASE_HOST \
  --set image.repository=$ECR_URL_APP \
  --set image.tag=$IMAGE_TAG \
  --set socketServer.image.repository=$ECR_URL_SOCKET_SERVER \
  --set socketServer.image.tag=$IMAGE_TAG \
  --set envVars.SOCKETIO_SERVICE_URL.value=${RELEASE_NAME}-socket-server/socket.io/ \
  --install
