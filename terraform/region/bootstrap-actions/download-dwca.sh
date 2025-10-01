#!/usr/bin/env bash
set -e -o pipefail

DATA_RESOURCE_UID=${1:?No data resource UID provided}
DWCA_URL=${2:?No DWCA url provided}

curl -sL -o "/data/dwca-exports/${DATA_RESOURCE_UID}.zip" -f "${DWCA_URL}"

#hdfs dfs -mkdir -p /dwca-exports
#hdfs dfs -rm -r -f "/dwca-exports/${DATA_RESOURCE_UID}.zip"
#hdfs dfs -copyFromLocal -f "/tmp/${DATA_RESOURCE_UID}.zip" /dwca-exports/