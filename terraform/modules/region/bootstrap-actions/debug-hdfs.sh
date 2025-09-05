#!/bin/bash
set -e -x -o pipefail

hdfs dfs -lsr "hdfs:///"
