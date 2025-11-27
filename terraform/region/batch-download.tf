resource "aws_batch_job_definition" "download_data_resource" {
  name = "download-data-resources"
  type = "container"

  platform_capabilities = [
    "FARGATE",
  ]

  # Don't know why this is necessary
  lifecycle {
    ignore_changes = [tags_all]
  }

  #   parameters = {
  #     "DATA_RESOURCE_ID" = "CHANGE_ME"
  #   }

  container_properties = jsonencode({
    name = var.name
    environment = [
      { name : "DATA_RESOURCE_ID", value : "Ref::DATA_RESOURCE_ID" },
      { name : "DATA_RESOURCE_URL", value : "Ref::DATA_RESOURCE_URL" },
      { name : "DYNAMODB_FILE_HISTORY_TABLE", value : aws_dynamodb_table.biodiversiteitsportaal_pipelines.id },
    ],
    secrets = [
      {
        name      = "APIKEY"
        valueFrom = aws_secretsmanager_secret.apikey_credentials.arn
      }
    ],
    command = [
      <<EOF
aws s3 cp s3://inbo-vbp-dev-pipelines/bootstrap-actions/download-data-resource.sh download-data-resource.sh
bash download-data-resource.sh
EOF
    ]
    image      = "${var.ecr_repo}/${var.resource_prefix}pipelines:${var.docker_version}"
    jobRoleArn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipelines-batch-role"

    fargatePlatformConfiguration = {
      platformVersion = "LATEST"
    }

    runtimePlatform = {
      operatingSystemFamily = "LINUX"
      cpuArchitecture = "ARM64"
    }

    resourceRequirements = [
      {
        type  = "VCPU"
        value = "0.25"
      },
      {
        type = "MEMORY"
        value = "512"
      }
    ]

    mountPoints = [
      {
        sourceVolume  = "collectory"
        containerPath = "/collectory"
        readOnly      = false
      }
    ]

    volumes = [
      {
        name = "collectory"
        efsVolumeConfiguration = {
          fileSystemId          = var.collectory_data_volume.volume_id
          transitEncryption     = "ENABLED"
          transitEncryptionPort = 2049
          authorizationConfig = {
            accessPointId = var.collectory_data_volume.access_point_id
            iam           = "ENABLED"
          }
        }
      }
    ]

    executionRoleArn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipelines-batch-exec-role"

    logConfiguration = {
      logDriver = "awslogs",
      options = {
        awslogs-group         = var.log_group_name,
        awslogs-region        = var.aws_region,
        awslogs-stream-prefix = "batch/download-data-resources"
      },
      secretOptions = []
    }
  })
}
