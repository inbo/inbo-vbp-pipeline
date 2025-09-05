#!/bin/bash
set -e -x -o pipefail

DATA_RESOURCE_ID=${1:?DATA_RESOURCE_ID is required as first argument}
COMPUTE_ENVIRONMENT=${2:?cluster}

./la-pipelines dwca-avro  ${DATA_RESOURCE_ID}
./la-pipelines interpret  --${COMPUTE_ENVIRONMENT} ${DATA_RESOURCE_ID}
./la-pipelines validate   --${COMPUTE_ENVIRONMENT} ${DATA_RESOURCE_ID}
./la-pipelines image-sync --${COMPUTE_ENVIRONMENT} ${DATA_RESOURCE_ID}
./la-pipelines index      --${COMPUTE_ENVIRONMENT} ${DATA_RESOURCE_ID}
