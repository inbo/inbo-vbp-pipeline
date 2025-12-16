resource "aws_batch_job_definition" "dwca_to_verbatim" {
  name = "dwca-to-verbatim"
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
      <<-EOT
      #!/usr/bin/env bash
      set -e -x -o pipefail

      mkdir -p /tmp/spark && chmod 777 /tmp/spark
      mkdir -p /tmp/dwca && chmod 777 /tmp/dwca

      ls -la /tmp
      df -h

      aws s3 cp s3://${aws_s3_bucket.pipelines.bucket}/${aws_s3_object.batch_pipelines_config.id} ../configs/la-pipelines.yaml
      aws s3 cp s3://${aws_s3_bucket.pipelines.bucket}/${aws_s3_object.batch_pipelines_log_config.id} ../configs/log4j.properties
      sed -i "s\\\$${APIKEY}\\$${APIKEY}\\g" ../configs/la-pipelines.yaml
      sed -i "s\\inbo-vbp-dev-pipelines\\${aws_s3_bucket.pipelines.bucket}\\g" ../configs/la-pipelines.yaml

      export LOG_CONFIG="$(pwd)/../configs/log4j.properties"

      $(aws configure --debug export-credentials | yq -r '"export AWS_ACCESS_KEY_ID=" + .AccessKeyId + "\nexport AWS_SECRET_ACCESS_KEY="  + .SecretAccessKey + "\nexport AWS_SESSION_TOKEN=" + .SessionToken')

      ./la-pipelines dwca-avro $${DATA_RESOURCE_ID} --config ../configs/la-pipelines.yaml --extra-args=awsRegion=eu-west-1
 EOT
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
        value = "1"
      },
      {
        type = "MEMORY"
        value = tostring(2 * 1024)
      }
    ]

    ephemeralStorage = {
      sizeInGiB = 200
    }

    mountPoints = [
      {
        sourceVolume  = "collectory"
        containerPath = "/data"
        readOnly      = false
      },
      {
        sourceVolume  = "temp"
        containerPath = "/tmp"
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
        },
      },
      {
        name = "temp"
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
