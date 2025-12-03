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
      <<-EOT
        #!/usr/bin/env bash
        set -e -x -o pipefail

        mkdir -p /data/pipelines-shp
        mkdir -p /tmp/pipelines && chmod 777 /tmp/pipelines

        aws s3 sync s3://${aws_s3_bucket.pipelines.bucket}/shp-layers/ /data/pipelines-shp
        aws s3 sync s3://${aws_s3_bucket.pipelines.bucket}/pipelines-vocabularies/ /data/pipelines-vocabularies

        aws s3 cp s3://${aws_s3_bucket.pipelines.bucket}/${aws_s3_object.batch_pipelines_config.id} ../configs/la-pipelines.yaml
        aws s3 cp s3://${aws_s3_bucket.pipelines.bucket}/${aws_s3_object.batch_pipelines_log_config.id} ../configs/log4j.properties
        sed -i "s\\\$${APIKEY}\\$${APIKEY}\\g" ../configs/la-pipelines.yaml

        export LOG_CONFIG="/app/livingatlas/pipelines/src/main/resources/log4j.properties"

        $(aws configure --debug export-credentials | yq -r '"export AWS_ACCESS_KEY_ID=" + .AccessKeyId + "\nexport AWS_SECRET_ACCESS_KEY="  + .SecretAccessKey + "\nexport AWS_SESSION_TOKEN=" + .SessionToken')

        ./la-pipelines dwca-avro                            $${DATA_RESOURCE_ID} --config ../configs/la-pipelines.yaml --extra-args=awsRegion=eu-west-1,fsPath=s3://${aws_s3_bucket.pipelines.bucket}/data
        ./la-pipelines interpret  --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID} --config ../configs/la-pipelines.yaml --extra-args=awsRegion=eu-west-1,fsPath=s3://${aws_s3_bucket.pipelines.bucket}/data
        ./la-pipelines validate   --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID} --config ../configs/la-pipelines.yaml --extra-args=awsRegion=eu-west-1,fsPath=s3://${aws_s3_bucket.pipelines.bucket}/data
        ./la-pipelines uuid       --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID} --config ../configs/la-pipelines.yaml --extra-args=awsRegion=eu-west-1,fsPath=s3://${aws_s3_bucket.pipelines.bucket}/data
        ./la-pipelines image-sync --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID} --config ../configs/la-pipelines.yaml --extra-args=awsRegion=eu-west-1,fsPath=s3://${aws_s3_bucket.pipelines.bucket}/data
        ./la-pipelines image-load --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID} --config ../configs/la-pipelines.yaml --extra-args=awsRegion=eu-west-1,fsPath=s3://${aws_s3_bucket.pipelines.bucket}/data
        ./la-pipelines index      --$${COMPUTE_ENVIRONMENT} $${DATA_RESOURCE_ID} --config ../configs/la-pipelines.yaml --extra-args=awsRegion=eu-west-1,fsPath=s3://${aws_s3_bucket.pipelines.bucket}/data
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
