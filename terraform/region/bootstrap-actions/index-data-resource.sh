#!/usr/bin/env bash
set -e -x -o pipefail

mkdir -p /data/pipelines-shp
mkdir -p /tmp/pipelines && chmod 777 /tmp/pipelines

aws s3 sync s3://${aws_s3_bucket.pipelines.bucket}/shp-layers/ /data/pipelines-shp
aws s3 sync s3://${aws_s3_bucket.pipelines.bucket}/pipelines-vocabularies/ /data/pipelines-vocabularies

aws s3 cp s3://${aws_s3_bucket.pipelines.bucket}/${aws_s3_object.batch_pipelines_config.id} ../configs/la-pipelines.yaml
aws s3 cp s3://${aws_s3_bucket.pipelines.bucket}/${aws_s3_object.batch_pipelines_log_config.id} ../configs/log4j.properties
sed -i "s\\\$${APIKEY}\\$${APIKEY}\\g" ../configs/la-pipelines.yaml
sed -i "s\\\inbo-vbp-dev-pipelines\\${aws_s3_bucket.pipelines.bucket}\\g" ../configs/la-pipelines.yaml

export LOG_CONFIG="/app/livingatlas/pipelines/src/main/resources/log4j.properties"

$(aws configure --debug export-credentials | yq -r '"export AWS_ACCESS_KEY_ID=" + .AccessKeyId + "\nexport AWS_SECRET_ACCESS_KEY="  + .SecretAccessKey + "\nexport AWS_SESSION_TOKEN=" + .SessionToken')

./la-pipelines interpret  --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID} --config ../configs/la-pipelines.yaml --extra-args=awsRegion=eu-west-1
./la-pipelines validate   --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID} --config ../configs/la-pipelines.yaml --extra-args=awsRegion=eu-west-1
./la-pipelines uuid       --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID} --config ../configs/la-pipelines.yaml --extra-args=awsRegion=eu-west-1

MULTI_MEDIA_RECORDS=$(aws s3 cp s3://inbo-vbp-dev-pipelines/data/pipelines-data/dr45/0/interpretation-metrics.yml - | grep multimediaRecordsCountAttempted | awk '{ print $2}' || echo '0')
if [ $MULTI_MEDIA_RECORDS -gt 0 ]; then
  echo "Detected Multimedia Records ${MULTI_MEDIA_RECORDS}"
  ./la-pipelines image-sync --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID} --config ../configs/la-pipelines.yaml --extra-args=awsRegion=eu-west-1
  ./la-pipelines image-load --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID} --config ../configs/la-pipelines.yaml --extra-args=awsRegion=eu-west-1
fi

./la-pipelines index      --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID} --config ../configs/la-pipelines.yaml --extra-args=awsRegion=eu-west-1

