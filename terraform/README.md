# Terraform modules

These contain the AWS setup needed for the VBP pipeline.
It is split into a global and region module, as this is required by our internal terragrunt setup.

The global module should contain all resources that are not specifically tied to any AWS region.
Whereas the region module contains all region-specific resources.
(More or less :)) 