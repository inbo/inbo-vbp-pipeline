resource "aws_batch_job_definition" "la_pipelines" {
  name = "dwca-to-index"
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
      { name : "COMPUTE_ENVIRONMENT", value : "embedded" },
      { name : "DATA_RESOURCE_ID", value : "Ref::DATA_RESOURCE_ID" },
      { name : "LOG_CONFIG", value : "../configs/log4j.properties" },
    ],
    secrets = [
      {
        name      = "APIKEY"
        valueFrom = aws_secretsmanager_secret.apikey_credentials.arn
      }
    ],
    command = [
      <<EOF
aws s3 cp s3://inbo-vbp-dev-pipelines/bootstrap-actions/index-data-resource.sh index-data-resource.sh
bash index-data-resource.sh
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
        value = "4"
      },
      {
        type = "MEMORY"
        value = tostring(30 * 1024)
      }
    ]

    mountPoints = [
      {
        sourceVolume  = "collectory"
        containerPath = "/data"
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
        awslogs-stream-prefix = "batch/dwca-to-index"
        awslogs-multiline-pattern = "^\\d\\d\\d\\d-\\d\\d-\\d\\d \\d\\d:\\d\\d:\\d\\d,\\d\\d\\d"
      },
      secretOptions = []
    }
  })
}
