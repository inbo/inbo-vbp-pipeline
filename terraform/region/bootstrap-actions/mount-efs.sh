#!/bin/bash
set -e -o pipefail

EFS_VOLUME_ID=${1:?EFS_VOLUME_ID is required as first argument}
EFS_ACCESS_POINT_ID=${2:?EFS_ACCESS_POINT_ID is required as second argument}
MOUNT_POINT=${3:?MOUNT_POINT is required as third argument}

sudo yum install -y amazon-efs-utils

sudo mkdir -p "${MOUNT_POINT}"
sudo mount -t efs -o tls,accesspoint="${EFS_ACCESS_POINT_ID}" "${EFS_VOLUME_ID}" "${MOUNT_POINT}"