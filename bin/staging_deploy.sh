#!/usr/bin/env bash
set -e

ROOT=$(dirname "$0")
HELM_DIR="$ROOT/../helm_deploy/cla-frontend/"

helm upgrade $RELEASE_NAME \
  $HELM_DIR \
  --namespace=${KUBE_ENV_STAGING_NAMESPACE} \
  --values ${HELM_DIR}/values-staging.yaml \
  --set host=$RELEASE_HOST \
  --set image.repository=$ECR_URL_APP \
  --set image.tag=$IMAGE_TAG \
  --set socketServer.image.repository=$ECR_URL_SOCKET_SERVER \
  --set socketServer.image.tag=$IMAGE_TAG \
  --set-string pingdomIPs=$PINGDOM_IPS \
  --install
