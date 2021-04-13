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
  --set image.repository=$APP_DOCKER_REPOSITORY \
  --set image.tag=$IMAGE_TAG \
  --install