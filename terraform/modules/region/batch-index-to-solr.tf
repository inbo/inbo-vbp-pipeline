resource "aws_batch_job_definition" "index_to_solr" {
  name = "index-to-solr"
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
      { name : "SOLR_COLLECTION", value : "Ref::SOLR_COLLECTION" },
    ],
    command = [
      file("${path.module}/bootstrap-actions/index-to-solr.sh")
    ]
    image      = "${var.ecr_repo}/inbo-${var.application}-pipelines:${var.docker_version}"
    jobRoleArn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/inbo-${var.application}-pipelines-batch-role"

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
        sourceVolume  = "data"
        containerPath = "/data"
        readOnly      = false
      }
    ]

    volumes = [
      {
        name = "data"
        efsVolumeConfiguration = {
          fileSystemId          = aws_efs_file_system.data_volume.id
          transitEncryption     = "ENABLED"
          transitEncryptionPort = 2049
          authorizationConfig = {
            accessPointId = aws_efs_access_point.data_volume.id
            iam           = "ENABLED"
          }
        }
      }
    ]

    executionRoleArn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/inbo-${var.application}-pipelines-batch-exec-role"

    logConfiguration = {
      logDriver = "awslogs",
      options = {
        awslogs-group         = var.log_group_name,
        awslogs-region        = var.aws_region,
        awslogs-stream-prefix = "batch/index-to-solr"
      },
      secretOptions = []
    }
  })
}
