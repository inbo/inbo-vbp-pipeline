data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "biocache_index_management_role" {
  name = "${var.resource_prefix}biocache-index-management-lambda"

  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

data "aws_iam_policy_document" "biocache_index_management_permission" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:logs:eu-west-1:${data.aws_caller_identity.current.account_id}:log-group:/${var.organisation}/${var.application}/lambda",
      "arn:aws:logs:eu-west-1:${data.aws_caller_identity.current.account_id}:log-group:/${var.organisation}/${var.application}/lambda:log-stream:*",
    ]
  }
  // Required for running Lambda inside private VPC
  statement {
    effect = "Allow"

    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DescribeSubnets",
      "ec2:DeleteNetworkInterface",
      "ec2:AssignPrivateIpAddresses",
      "ec2:UnassignPrivateIpAddresses",
    ]

    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "*"
    ]
  }

  // Step Function Permissions
  statement {
    effect = "Allow"
    #tfsec:ignore:aws-iam-no-policy-wildcards
    actions = [
      "states:Describe*",
      "states:Create*",
      "states:Update*",
      "states:List*",
      "states:Start*",
      "states:Stop*"
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:states:${var.aws_region}:${data.aws_caller_identity.current.account_id}:stateMachine:${var.resource_prefix}pipeline*",
      "arn:aws:states:${var.aws_region}:${data.aws_caller_identity.current.account_id}:execution:${var.resource_prefix}pipeline*",
    ]
  }

  // EMR Terminate Cluster
  statement {
    effect = "Allow"

    actions = [
      "elasticmapreduce:TerminateJobFlows"
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = ["*"]
  }

  // DynamoDB Permissions
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
      "dynamodb:BatchGetItem"
    ]
    resources = [
      "arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/${var.resource_prefix}pipelines"
    ]
  }
  statement {
    effect = "Allow"
    actions = [
      "kms:Decrypt",
    ]
    resources = [var.dynamodb_kms_key_arn]
  }

}

resource "aws_iam_role_policy" "biocache-index-management" {
  name   = "biocache-index-management-lambda"
  role   = aws_iam_role.biocache_index_management_role.id
  policy = data.aws_iam_policy_document.biocache_index_management_permission.json
}
