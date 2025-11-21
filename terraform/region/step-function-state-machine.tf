data "aws_emr_release_labels" "emr_release" {
  filters {
    application = "Spark@3"
  }
}

locals {
  statemachine_config = jsonencode({
    base_domain = var.base_domain
    emr_release                                  = data.aws_emr_release_labels.emr_release.release_labels[0]
    iam_emr_service_role_arn                     = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipelines-emr-service-role"
    iam_emr_instance_profile_arn                 = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:instance-profile/${var.resource_prefix}pipelines-emr-instance-profile"
    iam_emr_scaling_role                         = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipelines-emr-scaling-role"
    emr_managed_master_security_group            = aws_security_group.emr_cluster_instances.id
    emr_managed_slave_security_group             = aws_security_group.emr_cluster_instances.id
    batch_security_group                         = aws_security_group.batch.id
    service_access_security_group                = aws_security_group.emr_service_access.id
    portal_authenticated_connection_arn          = aws_cloudwatch_event_connection.portal_authenticated_connection_oauth.arn
    biocache_service_base_url                    = "https://${var.base_domain}/biocache-service"
    collectory_base_url                          = "https://${var.base_domain}/collectory"
    species_list_base_url                        = "https://${var.base_domain}/species-list"
    spatial_service_base_url                     = "https://${var.base_domain}/spatial-service"
    download_data_resource_job_definition_arn    = aws_batch_job_definition.download_data_resource.arn
    process_data_resource_job_definition_arn     = aws_batch_job_definition.la_pipelines.arn
    sample_data_resource_job_definition_arn      = aws_batch_job_definition.spatial_sampling.arn
    index_to_solr_job_definition_arn             = aws_batch_job_definition.index_to_solr.arn
    delete_data_resource_data_job_definition_arn = aws_batch_job_definition.delete_data_resource_data.arn
    get_or_create_emr_cluster_state_machine_arn  = aws_sfn_state_machine.get_or_create_emr_cluster.arn
    cleanup_emr_cluster_state_machine_arn        = aws_sfn_state_machine.cleanup_emr_cluster.arn
    lambda_biocache_index_management_arn         = aws_lambda_function.biocache_index_management_lambda.qualified_arn
    job_queue_arn                                = aws_batch_job_queue.pipelines_queue.arn
    dynamodb_table_name                          = aws_dynamodb_table.biodiversiteitsportaal_pipelines.name
    apikey_secret_value                          = aws_secretsmanager_secret_version.apikey_credentials.secret_string
    dataresource_size_threshold                  = 10000000
    pipelines_version                            = var.docker_version
    master_ec2_instance_type                     = "m7g.xlarge"
    worker_ec2_instance_type                     = "m7g.xlarge"
    worker_max_spot_price                        = 0.15
    min_number_of_cluster_workers                = 2
    max_number_of_cluster_workers                = 4
    max_on_demand_number_of_cluster_workers      = 2
    idle_timout_termination_seconds              = 8 * 30 * 60
    emr_tags                                     = [
      for key, value in merge(data.aws_default_tags.current.tags, {
        for-use-with-amazon-emr-managed-policies = "true"
        Backup                                   = "false"
        Application                              = var.application
      }) : { Key = key, Value = value }
    ]
    ebs_root_volume_size              = 40
    efs_data_volume_id                = aws_efs_file_system.data_volume.id
    efs_data_access_point_id          = aws_efs_access_point.data_volume.id
    api_key_secret_arn                = aws_secretsmanager_secret.apikey_credentials.arn,
    s3_bucket_name_pipeline           = aws_s3_bucket.pipelines.bucket
    ec2_subnet_id                     = var.private_subnet_ids[0]
    state_machine_step_wrapper_arn    = aws_sfn_state_machine.step_wrapper.arn
    state_machine_lock_arn            = aws_sfn_state_machine.lock.arn
    state_machine_download_arn        = aws_sfn_state_machine.download.arn
    state_machine_index_arn           = aws_sfn_state_machine.index.arn
    state_machine_sample_arn          = aws_sfn_state_machine.sample.arn
    state_machine_solr_arn            = aws_sfn_state_machine.solr.arn
    concurrency_lock_check_interval_s = 8
    concurrency_lock_timeout_ms       = 4 * 3600 * 1000
    emr_step_concurrency_limit        = 10
    sqs_lock_queues                   = {for name, queue in aws_sqs_queue.lock-queues : name => queue.url}
    max_index_concurrency             = 6
    max_sample_concurrency            = 2
    max_solr_concurrency              = 2
  })
}

resource "aws_ssm_parameter" "statemachine_pipelines_config" {
  name = "${var.resource_prefix}pipelines-config"
  type = "String"
  value = statemachine_config
}

resource "aws_s3_object" "statemachine_pipelines_config" {
  bucket  = aws_s3_bucket.pipelines.bucket
  key     = "config/state-machine.json"
  content = local.statemachine_config
  etag = md5(local.statemachine_config)
}

resource "aws_sfn_state_machine" "pipeline" {
  name     = "${var.resource_prefix}pipelines"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/pipeline.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")

  tracing_configuration {
    enabled = true
  }
}

resource "aws_sfn_state_machine" "step_wrapper" {
  name     = "${var.resource_prefix}pipelines-step-wrapper"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/step-wrapper.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")

  tracing_configuration {
    enabled = true
  }
}

resource "aws_sfn_state_machine" "lock" {
  name     = "${var.resource_prefix}pipelines-lock"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/lock.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")

  tracing_configuration {
    enabled = true
  }
}

resource "aws_sfn_state_machine" "download" {
  name     = "${var.resource_prefix}pipelines-download"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/download-data-resource.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")

  tracing_configuration {
    enabled = true
  }
}

resource "aws_sfn_state_machine" "index" {
  name     = "${var.resource_prefix}pipelines-index"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/index-data-resource.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")

  tracing_configuration {
    enabled = true
  }
}

resource "aws_sfn_state_machine" "sample" {
  name     = "${var.resource_prefix}pipelines-sample"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/sample-data-resource.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")

  tracing_configuration {
    enabled = true
  }
}

resource "aws_sfn_state_machine" "solr" {
  name     = "${var.resource_prefix}pipelines-solr"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/solr-data-resource.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")

  tracing_configuration {
    enabled = true
  }
}

resource "aws_sfn_state_machine" "get_or_create_emr_cluster" {
  name     = "${var.resource_prefix}pipelines-get-or-create-emr-cluster"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/get-or-create-emr-cluster.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")

  tracing_configuration {
    enabled = true
  }
}

resource "aws_sfn_state_machine" "cleanup_emr_cluster" {
  name     = "${var.resource_prefix}pipelines-cleanup-emr-cluster"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/cleanup-emr-cluster.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")

  tracing_configuration {
    enabled = true
  }
}

resource "aws_ec2_tag" "subnet_emr_managed_policy_tag" {
  for_each = toset(var.private_subnet_ids)
  resource_id = each.value
  key         = "for-use-with-amazon-emr-managed-policies"
  value       = "true"
}

resource "aws_cloudwatch_event_connection" "portal_authenticated_connection_oauth" {
  name               = "${var.resource_prefix}pipelines-step-function-oauth-connection"
  authorization_type = "OAUTH_CLIENT_CREDENTIALS"

  auth_parameters {
    oauth {
      authorization_endpoint = var.oauth.token_endpoint
      http_method            = "POST"

      client_parameters {
        client_id     = var.oauth.client_id
        client_secret = var.oauth.client_secret
      }

      oauth_http_parameters {
        body {
          key   = "grant_type"
          value = "client_credentials"
        }
      }
    }
  }
}