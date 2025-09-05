#!/bin/bash
set -e -o pipefail
# Required env vars
DATA_RESOURCE_ID=${DATA_RESOURCE_ID:?DATA_RESOURCE_ID is required as env var}

ls -la /data
ls -la /data/*

rm -rfv "/data/dwca-export/${DATA_RESOURCE_ID}" || true
rm -rfv "/data/pipelines-data/${DATA_RESOURCE_ID}" || true
rm -rfv "/data/pipelines-all-datasets/${DATA_RESOURCE_ID}" || true
