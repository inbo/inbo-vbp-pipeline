#!/bin/bash
set -e -x -o pipefail

DATA_RESOURCE_ID=${1:?DATA_RESOURCE_ID is required as first argument}

# Needs chown on dfs because EFS only allows changing ownership of a file when he is superuser (chown_restricted)
hdfs dfs -chown -R ec2-user:ec2-user "hdfs:///${DATA_RESOURCE_ID}"
hdfs dfs -chown -R ec2-user:ec2-user "hdfs:///pipelines-all-datasets/index-record/${DATA_RESOURCE_ID}"

rm -rf "/data/pipelines-data/${DATA_RESOURCE_ID}"
hdfs dfs -get -f "hdfs:///${DATA_RESOURCE_ID}" "/data/pipelines-data"

rm -rf "/data/pipelines-all-datasets/index-record/${DATA_RESOURCE_ID}"
hdfs dfs -get -f "hdfs:///pipelines-all-datasets/index-record/${DATA_RESOURCE_ID}" "/data/pipelines-all-datasets/index-record"
