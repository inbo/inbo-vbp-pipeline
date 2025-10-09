variable "application" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "name" {
  type = string
}

variable "organisation" {
  type    = string
  default = "inbo"
}

variable "resource_prefix" {
  type    = string
  default = "inbo-vbp-"
}

variable "ecs_cluster_arn" {
  type = string
}

variable "docker_version" {
  type = string
}


variable "environment" {
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "secrets" {
  type = list(object({
    name      = string
    valueFrom = string
  }))
  default = []
}

variable "base_domain" {
  type = string
}

variable "cpu" {
  type    = number
  default = 512
}
variable "memory" {
  type    = number
  default = 1024
}


variable "user" {
  type    = string
  default = "1000:1000"
}

variable "collectory_data_volume" {
  type = object({
    volume_id         = string
    access_point_id   = string
    security_group_id = string
  })
}

variable "efs_kms_key_arn" {
  type = string
}

variable "secrets_kms_key_arn" {
  type = string
}

variable "dynamodb_kms_key_arn" {
  type = string
}

variable "log_group_name" {
  type = string
}

variable "main_vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}
variable "ecr_repo" {
  type = string
}
variable "aws_iam_role" {
  type = string
}

variable "aws_env" {
  type = string
}

variable "solr" {
  type = object({
    base_url          = string
    security_group_id = string
  })
}

variable "lambdas" {
  type = object({
    bucket         = string
    log_group_name = string
    versions = object({
      biocache-index-management = string
    })
  })
}

variable "oauth" {
  type = object({
    authorization_endpoint = string
    jwks_uri               = string
    client_id              = string
    client_secret          = string
  })
  sensitive = true
}