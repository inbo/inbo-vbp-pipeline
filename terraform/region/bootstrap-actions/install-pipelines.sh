#!/bin/bash
set -e -x -o pipefail

APIKEY_SECRET_ARN=${1:?No APIKEY_SECRET_ARN provided}
PIPELINE_BUCKET_NAME=${2:?No PIPELINE_BUCKET_NAME provided}
PIPELINE_VERSION=${3:?No PIPELINE_VERSION provided}

sudo aws s3 sync --delete \
  --exclude "*" \
  --include "pipelines-${PIPELINE_VERSION}.jar" \
  "s3://${PIPELINE_BUCKET_NAME}" /opt/inbo/pipelines

sudo chown -R hadoop:yarn /opt/inbo/pipelines
sudo chmod +x -R /opt/inbo/pipelines/bootstrap-actions
sudo chmod +x "/opt/inbo/pipelines/pipelines-${PIPELINE_VERSION}.jar"

APIKEY=$(aws secretsmanager get-secret-value --secret-id "${APIKEY_SECRET_ARN}" --output text --query 'SecretString')
sudo sed -i "s@\${APIKEY}@${APIKEY}@g" /opt/inbo/pipelines/config/la-pipelines.yaml

mkdir -p /tmp/pipelines && chmod 777 /tmp/pipelines