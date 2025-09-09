#!/bin/bash
set -e -x -o pipefail

DATA_RESOURCE_ID=${1:?DATA_RESOURCE_ID is required as first argument}

ls -la /data/
ls -la /data/pipelines-all-datasets
ls -la /data/pipelines-all-datasets/index-record

hdfs dfs -put -p -f "/data/pipelines-data/${DATA_RESOURCE_ID}" "hdfs:///"
hdfs dfs -put -p -f /data/pipelines-all-datasets/index-record/${DATA_RESOURCE_ID} "hdfs:///pipelines-all-datasets/index-record"
hdfs dfs -ls -R "hdfs:///"
