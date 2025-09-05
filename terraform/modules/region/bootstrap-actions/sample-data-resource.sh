#!/bin/bash
set -e -x -o pipefail

# Required env var
DATA_RESOURCE_ID=${DATA_RESOURCE_ID:?DATA_RESOURCE_ID is required as env var}

#Optional env var
COMPUTE_ENVIRONMENT=${COMPUTE_ENVIRONMENT:-embedded}

./la-pipelines sample      --${COMPUTE_ENVIRONMENT} ${DATA_RESOURCE_ID}
