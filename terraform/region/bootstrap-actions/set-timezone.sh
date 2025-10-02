#!/bin/bash
set -e -o pipefail

TIME_ZONE=${1:?TIME_ZONE is required as first argument}

sudo timedatectl set-timezone "${TIME_ZONE}"
