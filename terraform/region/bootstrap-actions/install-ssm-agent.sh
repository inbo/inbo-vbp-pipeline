#!/bin/bash
set -e -x -o pipefail
## Name: SSM Agent Installer Script
## Description: Installs SSM Agent on EMR cluster EC2 instances and update hosts file
##

sudo yum install -y https://s3.eu-west-1.amazonaws.com/amazon-ssm-eu-west-1/latest/linux_arm64/amazon-ssm-agent.rpm
sudo systemctl start amazon-ssm-agent
sudo systemctl status amazon-ssm-agent
