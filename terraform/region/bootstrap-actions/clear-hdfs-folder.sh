#!/bin/bash
set -e

HDFS_FOLDER=${1:?No hdfs folder provided}

hdfs dfs -rm -r -f "${HDFS_FOLDER}"