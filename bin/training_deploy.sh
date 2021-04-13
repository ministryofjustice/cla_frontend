#!/usr/bin/env bash
set -e

ROOT=$(dirname "$0")
HELM_DIR="$ROOT/../helm_deploy/cla-frontend/"

helm upgrade $RELEASE_NAME \
  $HELM_DIR \
  --namespace=${KUBE_ENV_TRAINING_NAMESPACE} \
  --values ${HELM_DIR}/values-training.yaml \
  --set host=$RELEASE_HOST \
  --set secretName=tls-certificate \
  --set image.repository=$APP_DOCKER_REPOSITORY \
  --set image.tag=$IMAGE_TAG \
  --set-string pingdomIPs=$PINGDOM_IPS \
  --install