#!/bin/bash
## Name: SSM Agent Installer Script
## Description: Installs SSM Agent on EMR cluster EC2 instances and update hosts file
##

sudo yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_arm64/amazon-ssm-agent.rpm
sudo systemctl status amazon-ssm-agent
sudo systemctl status amazon-ssm-agent
