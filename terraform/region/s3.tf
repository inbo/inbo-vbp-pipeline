#tfsec:ignore:aws-s3-enable-bucket-encryption tfsec:ignore:aws-s3-encryption-customer-key tfsec:ignore:aws-s3-enable-bucket-logging tfsec:ignore:aws-s3-enable-versioning
resource "aws_s3_bucket" "pipelines" {
  bucket = "${var.resource_prefix}${var.aws_env}-pipelines"

  tags = {
    Backup = "false"
  }
}

resource "aws_s3_bucket_public_access_block" "biodiversiteitsportaal_downloads" {
  bucket = aws_s3_bucket.pipelines.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_object" "emr_pipelines_config" {
  bucket = aws_s3_bucket.pipelines.bucket
  key    = "config/la-pipelines.yaml"
  source = "${path.module}/config/la-pipelines.yaml"
  etag = filemd5("${path.module}/config/la-pipelines.yaml")
}

resource "aws_s3_object" "batch_pipelines_config" {
  bucket = aws_s3_bucket.pipelines.bucket
  key    = "config/la-pipelines-batch.yaml"
  source = "${path.module}/config/la-pipelines-batch.yaml"
  etag = filemd5("${path.module}/config/la-pipelines-batch.yaml")
}


resource "aws_s3_object" "emr_pipelines_elastic_schema" {
  bucket = aws_s3_bucket.pipelines.bucket
  key    = "config/es-event-core-schema.json"
  source = "${path.module}/config/es-event-core-schema.json"
  etag = filemd5("${path.module}/config/es-event-core-schema.json")
}

resource "aws_s3_object" "pipelines-vocabularies" {
  for_each = fileset("${path.module}/config/pipelines-vocabularies", "*")

  bucket = aws_s3_bucket.pipelines.bucket
  key    = "pipelines-vocabularies/${each.value}"
  source = "${path.module}/config/pipelines-vocabularies/${each.value}"

  etag = filemd5("${path.module}/config/pipelines-vocabularies/${each.value}")
}

resource "aws_s3_object" "bootstrap_actions" {
  for_each = fileset("${path.module}/bootstrap-actions", "*")

  bucket = aws_s3_bucket.pipelines.bucket
  key    = "bootstrap-actions/${each.value}"
  source = "${path.module}/bootstrap-actions/${each.value}"

  etag = filemd5("${path.module}/bootstrap-actions/${each.value}")
}

resource "aws_ssm_parameter" "emr_cloudwatch_agent_config" {
  name  = "EMRCloudwatchConfig.json"
  type  = "String"
  value = <<EOF
{
   "agent":{
      "logfile":"/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log",
      "debug":false,
      "run_as_user":"cwagent"
   },
   "logs":{
      "logs_collected":{
         "files":{
            "collect_list":[
               {
                  "file_path":"/emr/instance-controller/log/bootstrap-actions/*/*",
                  "log_group_name":"${var.log_group_name}",
                  "log_stream_name": "emr/{instance_id}",
                  "publish_multi_logs": true,
                  "multi_line_start_pattern":"{timestamp_regex}",
                  "timezone":"UTC"
               },
               {
                  "file_path":"/mnt/var/log/hadoop/steps/*/*",
                  "log_group_name":"${var.log_group_name}",
                  "log_stream_name": "emr/{instance_id}",
                  "publish_multi_logs": true,
                  "timestamp_regex": "^(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.?\\d*Z).*",
                  "multi_line_start_pattern":"{timestamp_regex}",
                  "timezone":"UTC"
               }
            ]
         }
      }
   }
}
EOF
}

resource "null_resource" "shp-layers" {
  triggers = {
    s3_bucket = aws_s3_bucket.pipelines.id
  }

  provisioner "local-exec" {
    command = <<EOF
set -e -o pipefail

$(aws sts assume-role --role-arn ${var.aws_iam_role} --role-session-name tf-${var.application}-upload-branding --query 'Credentials.[`export#AWS_ACCESS_KEY_ID=`,AccessKeyId,`#AWS_SECRET_ACCESS_KEY=`,SecretAccessKey,`#AWS_SESSION_TOKEN=`,SessionToken]' --output text | sed $'s/\t//g' | sed 's/#/ /g')

# Download layers
curl -sf https://pipelines-shp.s3-ap-southeast-2.amazonaws.com/pipelines-shapefiles.zip -o /tmp/pipelines-shapefiles.zip

# Unzip
mkdir -p /tmp/shp-layers
unzip -o -d /tmp/shp-layers /tmp/pipelines-shapefiles.zip

# Upload jar to S3
aws s3 sync /tmp/shp-layers s3://${aws_s3_bucket.pipelines.bucket}/shp-layers

# Clean up
rm -rf /tmp/shp-layers
rm /tmp/pipelines-shapefiles.zip
EOF
  }
}