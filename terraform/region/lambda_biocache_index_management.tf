resource "aws_lb_target_group" "biocache_index_management_lambda" {
  name        = "inbo-${var.application}-biocache-index-mgmt"
  target_type = "lambda"
}

resource "aws_lb_target_group_attachment" "biocache_index_management_lambda" {
  target_group_arn = aws_lb_target_group.biocache_index_management_lambda.arn
  target_id        = aws_lambda_function.biocache_index_management_lambda.arn

}

resource "aws_lambda_permission" "biocache_index_management_lambda_invocation_policy" {
  statement_id  = "AllowExecutionFromALB"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.biocache_index_management_lambda.function_name
  principal     = "elasticloadbalancing.amazonaws.com"
  source_arn    = aws_lb_target_group.biocache_index_management_lambda.arn
}

resource "null_resource" "download_lambda_package" {
  triggers = {
    on_version_change = var.lambdas.versions.biocache-index-management
  }

  provisioner "local-exec" {
    command = <<EOF
set -e -x -o pipefail

$(aws sts assume-role --role-arn ${var.aws_iam_role} --role-session-name tf-${var.application}-upload-branding --query 'Credentials.[`export#AWS_ACCESS_KEY_ID=`,AccessKeyId,`#AWS_SECRET_ACCESS_KEY=`,SecretAccessKey,`#AWS_SESSION_TOKEN=`,SessionToken]' --output text | sed $'s/\t//g' | sed 's/#/ /g')

curl --fail --verbose -L \
  https://github.com/inbo/inbo-vbp-pipeline/releases/download/lambda-biocache-index-management-v${var.lambdas.versions.biocache-index-management}/biocache-index-management-${var.lambdas.versions.biocache-index-management}.zip \
  -o biocache-index-management-${var.lambdas.versions.biocache-index-management}.zip

# Upload jar to S3
aws s3 cp ./biocache-index-management-${var.lambdas.versions.biocache-index-management}.zip s3://${var.lambdas.bucket}/biocache-index-management/biocache-index-management-${var.lambdas.versions.biocache-index-management}.zip

EOF
  }

}

data "aws_s3_object" "biocache_index_management_lambda" {
  bucket = var.lambdas.bucket
  key    = "biocache-index-management/biocache-index-management-${var.lambdas.versions.biocache-index-management}.zip"

  depends_on = [
    null_resource.download_lambda_package
  ]
}

#tfsec:ignore:aws-lambda-enable-tracing - no other logs to correlate with
resource "aws_lambda_function" "biocache_index_management_lambda" {
  function_name     = "inbo-${var.application}-biocache-index-management"
  s3_bucket         = data.aws_s3_object.biocache_index_management_lambda.bucket
  s3_key            = data.aws_s3_object.biocache_index_management_lambda.key
  s3_object_version = data.aws_s3_object.biocache_index_management_lambda.version_id
  role              = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/inbo-${var.application}-biocache-index-management-lambda"
  runtime           = "nodejs22.x"
  handler           = "server.graphqlHandler"
  timeout           = 10

  vpc_config {
    security_group_ids = [aws_security_group.biocache_index_management.id]
    subnet_ids = var.private_subnet_ids
  }

  environment {
    variables = {
      SOLR_BASE_URL                     = var.solr.base_url
      SOLR_BIOCACHE_SCHEMA_CONFIG       = "biocache"
      SOLR_BIOCACHE_NUMBER_OF_SHARDS    = "4"
      SOLR_BIOCACHE_MAX_SHARDS_PER_NODE = "4"
      AWS_STATE_MACHINE_ARN             = aws_sfn_state_machine.pipeline.arn
      AWS_DYNAMODB_TABLE_NAME           = aws_dynamodb_table.biodiversiteitsportaal_pipelines.name
      JWKS_URI                          = var.jwks_uri
    }
  }

  logging_config {
    log_group  = var.lambdas.log_group_name
    log_format = "JSON"
  }
}

resource "aws_security_group" "biocache_index_management" {
  name        = "inbo-vbp-pipeline-biocache-index-management"
  description = "VBP Solr management Lambda security group"
  vpc_id      = var.main_vpc_id
}

resource "aws_security_group_rule" "biocache_index_management_lambda_solr_egress" {
  type                     = "egress"
  security_group_id        = aws_security_group.biocache_index_management.id
  source_security_group_id = var.solr.security_group_id
  from_port                = 8983
  to_port                  = 8983
  protocol                 = "tcp"
  description              = "Allow Solr management lambda to connect to SOLR"
}

resource "aws_security_group_rule" "biocache_index_management_lambda_solr_ingress" {
  type                     = "ingress"
  security_group_id        = var.solr.security_group_id
  source_security_group_id = aws_security_group.biocache_index_management.id
  from_port                = 8983
  to_port                  = 8983
  protocol                 = "tcp"
  description              = "Allow Solr management lambda to connect to SOLR"
}


resource "aws_security_group_rule" "biocache_index_management_lambda_keycloak_egress" {
  type              = "egress"
  security_group_id = aws_security_group.biocache_index_management.id
  cidr_blocks = ["0.0.0.0/0"] #tfsec:ignore:aws-ec2-no-public-egress-sgr
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  description       = "Allow Solr management lambda to connect to keycloak"
}

resource "aws_lambda_permission" "lambda_permission_alb" {
  statement_id  = "AllowALBInvokeBiocacheIndexManagementLambda"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.biocache_index_management_lambda.function_name
  principal     = "elasticloadbalancing.amazonaws.com"
  source_arn    = aws_lb_target_group.biocache_index_management_lambda.arn
}