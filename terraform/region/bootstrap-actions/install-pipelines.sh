#!/bin/bash
set -e -x -o pipefail

APIKEY_SECRET_ARN=${1:?No APIKEY_SECRET_ARN provided}
PIPELINE_BUCKET_NAME=${2:?No PIPELINE_BUCKET_NAME provided}
PIPELINE_VERSION=${3:?No PIPELINE_VERSION provided}

sudo aws s3 cp "s3://${PIPELINE_BUCKET_NAME}/pipelines-${PIPELINE_VERSION}.jar" "/opt/inbo/pipelines/pipelines-${PIPELINE_VERSION}.jar"

sudo mkdir -p /opt/inbo/pipelines/config
sudo aws s3 sync "s3://${PIPELINE_BUCKET_NAME}/config" /opt/inbo/pipelines/config

sudo mkdir -p /opt/inbo/pipelines/shp-layers
sudo aws s3 sync "s3://${PIPELINE_BUCKET_NAME}/shp-layers" /opt/inbo/pipelines/shp-layers

sudo mkdir -p /opt/inbo/pipelines/pipelines-vocabularies
sudo aws s3 sync "s3://${PIPELINE_BUCKET_NAME}/pipelines-vocabularies" /opt/inbo/pipelines/pipelines-vocabularies

sudo mkdir -p /opt/inbo/pipelines/bootstrap-actions
sudo aws s3 sync "s3://${PIPELINE_BUCKET_NAME}/bootstrap-actions" /opt/inbo/pipelines/bootstrap-actions


sudo chown -R hadoop:yarn /opt/inbo/pipelines
sudo chmod +x /opt/inbo/pipelines/boostrap-actions
sudo chmod +x "/opt/inbo/pipelines/pipelines-${PIPELINE_VERSION}.jar"

mkdir -p /data/dwca-exports

APIKEY=$(aws secretsmanager get-secret-value --secret-id "${APIKEY_SECRET_ARN}" --output text --query 'SecretString')
sudo sed -i "s@\${APIKEY}@${APIKEY}@g" /opt/inbo/pipelines/config/la-pipelines.yaml