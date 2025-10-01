#!/bin/bash
set -e -o pipefail

APIKEY_SECRET_ARN=${1:?No APIKEY_SECRET_ARN provided}
PIPELINE_BUCKET_NAME=${2:?No PIPELINE_BUCKET_NAME provided}

sudo mkdir -p /opt/inbo/pipelines

sudo aws s3 sync "s3://${PIPELINE_BUCKET_NAME}/" /opt/inbo/pipelines --exclude 'logs/*'
sudo chown -R hadoop:yarn /opt/inbo/pipelines
sudo chmod +x /opt/inbo/pipelines/bootstrap-actions/*.sh

sudo mkdir -p /data/
#sudo chown hadoop:yarn -Rv /data

mkdir -p /data/dwca-exports

APIKEY=$(aws secretsmanager get-secret-value --secret-id "${APIKEY_SECRET_ARN}" --output text --query 'SecretString')
sed -i "s@\${APIKEY}@${APIKEY}@g" /opt/inbo/pipelines/config/la-pipelines.yaml