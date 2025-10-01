#!/bin/bash
set -e -o pipefail

echo -e 'Installing CloudWatch Agent... \n'
sudo rpm -ivv -Uvh --force https://amazoncloudwatch-agent.s3.amazonaws.com/amazon_linux/arm64/latest/amazon-cloudwatch-agent.rpm

echo -e 'Allow CloudWatch Agent to read hadoop logs... \n'
sudo usermod -a -G yarn cwagent

echo -e 'Starting CloudWatch Agent... \n'
sudo amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c ssm:EMRCloudwatchConfig.json -s