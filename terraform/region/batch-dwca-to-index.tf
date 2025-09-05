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
    ],
    secrets = [
      {
        name      = "APIKEY"
        valueFrom = aws_secretsmanager_secret.apikey_credentials.arn
      }
    ],
    command = [
      <<-EOT
        #!/usr/bin/env bash
        set -e -x -o pipefail

        mkdir -p /data/dwca-imports
        mkdir -p /data/dwca-tmp
        mkdir -p /data/biocache-load/$${DATA_RESOURCE_ID}
        mkdir -p /data/pipelines-data/$${DATA_RESOURCE_ID}
        mkdir -p /data/pipelines-shp
        mkdir -p /data/pipelines-all-datasets

        aws s3 sync s3://${aws_s3_bucket.pipelines.bucket}/shp-layers/ /data/pipelines-shp
        aws s3 sync s3://${aws_s3_bucket.pipelines.bucket}/pipelines-vocabularies/ /data/pipelines-vocabularies

        aws s3 cp s3://${aws_s3_bucket.pipelines.bucket}/${aws_s3_object.batch_pipelines_config.id} ../configs/la-pipelines.yaml
        sed -i "s\\\$${APIKEY}\\$${APIKEY}\\g" ../configs/la-pipelines.yaml

        cp /data/dwca-export/$${DATA_RESOURCE_ID}/$${DATA_RESOURCE_ID}.zip /data/biocache-load/$${DATA_RESOURCE_ID}/$${DATA_RESOURCE_ID}.zip

        ./la-pipelines dwca-avro  $${DATA_RESOURCE_ID}
        ./la-pipelines interpret  --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID}
        ./la-pipelines validate   --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID}
        ./la-pipelines uuid       --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID}
        ./la-pipelines sds        --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID}
        ./la-pipelines image-sync --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID}
        ./la-pipelines image-load --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID}
        ./la-pipelines index      --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID}
 EOT
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
        value = "4"
      },
      {
        type = "MEMORY"
        value = tostring(30 * 1024)
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
        awslogs-stream-prefix = "batch/dwca-to-index"
      },
      secretOptions = []
    }
  })
}
