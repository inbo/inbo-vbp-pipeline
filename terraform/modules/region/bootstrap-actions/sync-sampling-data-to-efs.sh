#!/bin/bash
set -e -x -o pipefail

# Remove previous sampling
rm /data/pipelines-all-datasets/sampling-metrics.yml || true
rm -rf /data/pipelines-all-datasets/sampling || true

# Needs chown on dfs because EFS only allows changing ownership of a file when he is superuser (chown_restricted)
hdfs dfs -chown -R ec2-user:ec2-user "hdfs:///pipelines-all-datasets/sampling"
hdfs dfs -chown ec2-user:ec2-user "hdfs:///pipelines-all-datasets/sampling-metrics.yml"

hdfs dfs -get -p -f "hdfs:///pipelines-all-datasets/sampling" /data/pipelines-all-datasets
hdfs dfs -get -p -f "hdfs:///pipelines-all-datasets/sampling-metrics.yml" /data/pipelines-all-datasets
