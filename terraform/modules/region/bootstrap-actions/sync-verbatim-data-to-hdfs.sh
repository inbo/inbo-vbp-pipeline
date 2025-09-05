#!/bin/bash
set -e -x -o pipefail

DATA_RESOURCE_ID=${1:?DATA_RESOURCE_ID is required as first argument}

FOLDER="/data/pipelines-data/${DATA_RESOURCE_ID}"

if [[ -d ${FOLDER} ]]; then
  hdfs dfs -put -p -f "${FOLDER}" "hdfs:///"
fi