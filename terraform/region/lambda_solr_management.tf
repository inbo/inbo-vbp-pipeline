resource "aws_lb_target_group" "solr_management_lambda" {
  name        = "inbo-${var.application}-solr-management"
  target_type = "lambda"
}

resource "aws_lb_target_group_attachment" "solr_management_lambda" {
  target_group_arn = aws_lb_target_group.solr_management_lambda.arn
  target_id        = aws_lambda_function.solr_management_lambda.arn
}

resource "aws_lambda_permission" "solr_management_lambda_invocation_policy" {
  statement_id  = "AllowExecutionFromALB"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.solr_management_lambda.function_name
  principal     = "elasticloadbalancing.amazonaws.com"
  source_arn    = aws_lb_target_group.solr_management_lambda.arn
}

data "aws_s3_object" "solr_management_lambda" {
  bucket = var.lambdas.bucket
  key    = "solr-management/solr-management-${var.lambdas.versions.solr-management}.zip"
}

#tfsec:ignore:aws-lambda-enable-tracing - no other logs to correlate with
resource "aws_lambda_function" "solr_management_lambda" {
  function_name     = "inbo-${var.application}-solr-management"
  s3_bucket         = data.aws_s3_object.solr_management_lambda.bucket
  s3_key            = data.aws_s3_object.solr_management_lambda.key
  s3_object_version = data.aws_s3_object.solr_management_lambda.version_id
  role              = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/inbo-${var.application}-solr-management-lambda"
  runtime           = "nodejs22.x"
  handler           = "server.graphqlHandler"
  timeout           = 10

  vpc_config {
    security_group_ids = [aws_security_group.solr_management.id]
    subnet_ids = var.private_subnet_ids
  }

  environment {
    variables = {
      SOLR_BASE_URL = var.solr.base_url
    }
  }

  logging_config {
    log_group  = var.lambdas.log_group_name
    log_format = "JSON"
  }
}

resource "aws_security_group" "solr_management" {
  name        = "inbo-vbp-pipeline-solr-management"
  description = "VBP Solr management Lambda security group"
  vpc_id      = var.main_vpc_id
}

resource "aws_security_group_rule" "solr_management_lambda_solr_egress" {
  type                     = "egress"
  security_group_id        = aws_security_group.solr_management.id
  source_security_group_id = var.solr.security_group_id
  from_port                = 8983
  to_port                  = 8983
  protocol                 = "tcp"
  description              = "Allow Solr management lambda to connect to SOLR"
}

resource "aws_security_group_rule" "solr_management_lambda_keycloak_egress" {
  type              = "egress"
  security_group_id = aws_security_group.solr_management.id
  cidr_blocks = ["0.0.0.0/0"] #tfsec:ignore:aws-ec2-no-public-egress-sgr
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  description       = "Allow Solr management lambda to connect to keycloak"
}
