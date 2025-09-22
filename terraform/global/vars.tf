variable "application" {
  type = string
}

variable "organisation" {
  type = string
  default = "inbo"
}

variable "resource_prefix" {
  type = string
  default = "inbo-vbp-"
}

variable "log_group_name" {
  type = string
}

variable "ecr_repo" {
  type = string
}

variable "secrets_kms_key_arn" {
  type = string
}

variable "dynamodb_kms_key_arn" {
  type = string
}

variable "aws_region" {}

variable "base_domain" {
  type = string
}

variable "aws_env" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}