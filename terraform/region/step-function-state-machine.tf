locals {
  statemachine_config = jsonencode({
    base_domain                                  = var.base_domain
    iam_emr_service_role_arn                     = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipelines-emr-service-role"
    iam_emr_instance_profile_arn                 = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:instance-profile/${var.resource_prefix}pipelines-emr-instance-profile"
    emr_managed_master_security_group            = aws_security_group.emr_cluster_instances.id
    emr_managed_slave_security_group             = aws_security_group.emr_cluster_instances.id
    batch_security_group                         = aws_security_group.batch.id
    service_access_security_group                = aws_security_group.emr_service_access.id
    portal_authenticated_connection_arn          = aws_cloudwatch_event_connection.portal_authenticated_connection_sf.arn
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
    master_ec2_instance_type                     = "m7g.2xlarge"
    worker_ec2_instance_type                     = "m7g.4xlarge"
    number_of_cluster_workers                    = 2
    idle_timout_termination_seconds              = 1 * 60 * 60
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
    concurrency_lock_check_interval_s = 10
    concurrency_lock_timeout_ms       = 360 * 1000
  })
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
}

resource "aws_sfn_state_machine" "step_wrapper" {
  name     = "${var.resource_prefix}pipelines-step-wrapper"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/step-wrapper.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")
}

resource "aws_sfn_state_machine" "lock" {
  name     = "${var.resource_prefix}pipelines-lock"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/lock.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")
}

resource "aws_sfn_state_machine" "download" {
  name     = "${var.resource_prefix}pipelines-download"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/download-data-resource.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")
}

resource "aws_sfn_state_machine" "index" {
  name     = "${var.resource_prefix}pipelines-index"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/index-data-resource.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")
}

resource "aws_sfn_state_machine" "sample" {
  name     = "${var.resource_prefix}pipelines-sample"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/sample-data-resource.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")
}

resource "aws_sfn_state_machine" "solr" {
  name     = "${var.resource_prefix}pipelines-solr"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/solr-data-resource.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")
}

resource "aws_sfn_state_machine" "get_or_create_emr_cluster" {
  name     = "${var.resource_prefix}pipelines-get-or-create-emr-cluster"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/get-or-create-emr-cluster.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")
}

resource "aws_sfn_state_machine" "cleanup_emr_cluster" {
  name     = "${var.resource_prefix}pipelines-cleanup-emr-cluster"
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"

  definition = replace(file("${path.module}/step-function/cleanup-emr-cluster.json"), "${var.resource_prefix}dev-pipelines", "${var.resource_prefix}${var.aws_env}-pipelines")
}

resource "aws_cloudwatch_event_connection" "portal_authenticated_connection_sf" {
  name               = "${var.resource_prefix}pipelines-step-function"
  authorization_type = "API_KEY"
  auth_parameters {
    api_key {
      key   = "apiKey"
      value = aws_secretsmanager_secret_version.apikey_credentials.secret_string
    }
  }

  lifecycle {
    ignore_changes = [auth_parameters]
  }
}

resource "aws_ec2_tag" "subnet_emr_managed_policy_tag" {
  for_each = toset(var.private_subnet_ids)
  resource_id = each.value
  key         = "for-use-with-amazon-emr-managed-policies"
  value       = "true"
}