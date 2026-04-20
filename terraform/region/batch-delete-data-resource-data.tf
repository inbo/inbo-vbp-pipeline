resource "aws_batch_job_definition" "delete_data_resource_data" {
  name = "${var.resource_prefix}delete-data-resource-data"
  type = "container"

  platform_capabilities = [
    "FARGATE",
  ]

  container_properties = jsonencode({
    name = var.name
    environment = [
      { name : "DATA_RESOURCE_ID", value : "Ref::DATA_RESOURCE_ID" },
    ],
    command = [
      file("${path.module}/bootstrap-actions/delete-data-resource-data.sh")
    ]
    image      = "${var.ecr_repo}/${var.resource_prefix}pipelines:${var.docker_version}"
    jobRoleArn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipelines-batch-role"

    fargatePlatformConfiguration = {
      platformVersion = "LATEST"
    }

    runtimePlatform = {
      operatingSystemFamily = "LINUX"
      cpuArchitecture       = "ARM64"
    }

    resourceRequirements = [
      {
        type  = "VCPU"
        value = "0.25"
      },
      {
        type  = "MEMORY"
        value = "512"
      }
    ]

    readonlyRootFilesystem = true
    mountPoints = [
      {
        sourceVolume  = "temp"
        containerPath = "/tmp"
        readOnly      = false
      },
      {
        sourceVolume  = "collectory"
        containerPath = "/data"
        readOnly      = false
      }
    ]
    volumes = [
      {
        name = "temp"
      },
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
        awslogs-stream-prefix = "batch/delete-data-resource-data"
      },
      secretOptions = []
    }

    propagate_tags = true
  })
}
