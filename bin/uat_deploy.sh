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
  --set ingress.cluster.name=${INGRESS_CLUSTER_NAME} \
  --set ingress.cluster.weight=${INGRESS_CLUSTER_WEIGHT} \
  --set image.repository=$ECR_URL_APP \
  --set image.tag=$IMAGE_TAG \
  --set metrics.tag=$METRICS_IMAGE_TAG \
  --set metrics.repository=$ECR_URL_APP \
  --set socketServer.image.repository=$ECR_URL_SOCKET_SERVER \
  --set socketServer.image.tag=$IMAGE_TAG \
  --install
