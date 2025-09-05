#!/bin/bash
set -e -x -o pipefail

# Required env var
DATA_RESOURCE_ID=${DATA_RESOURCE_ID:?DATA_RESOURCE_ID is required as env var}
SOLR_COLLECTION=${SOLR_COLLECTION:?SOLR_COLLECTION is required as env var}

#Optional env var
COMPUTE_ENVIRONMENT=${COMPUTE_ENVIRONMENT:-embedded}

./la-pipelines solr    --${COMPUTE_ENVIRONMENT} ${DATA_RESOURCE_ID} --extra-args="solrCollection=${SOLR_COLLECTION}"
