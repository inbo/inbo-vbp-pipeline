#!/bin/bash
set -e

TARGETARCH=amd64

sudo curl -o /usr/bin/yq -LJO https://github.com/mikefarah/yq/releases/download/v4.44.3/yq_linux_${TARGETARCH}
sudo chmod +x /usr/bin/yq