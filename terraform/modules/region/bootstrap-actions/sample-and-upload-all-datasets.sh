#!/bin/bash
set -e -x -o pipefail

COMPUTE_ENVIRONMENT=${2:?cluster}

./la-pipelines sample --$${COMPUTE_ENVIRONMENT} all
./la-pipelines solr   --$${COMPUTE_ENVIRONMENT} all
