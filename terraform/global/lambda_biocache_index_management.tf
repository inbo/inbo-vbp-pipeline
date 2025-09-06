data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    effect = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "biocache_index_management_role" {
  name = "inbo-${var.application}-biocache-index-management-lambda"

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
      "arn:aws:logs:eu-west-1:${data.aws_caller_identity.current.account_id}:log-group:/inbo/${var.application}/lambda",
      "arn:aws:logs:eu-west-1:${data.aws_caller_identity.current.account_id}:log-group:/inbo/${var.application}/lambda:log-stream:*",
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

}

resource "aws_iam_role_policy" "biocache-index-management" {
  name   = "biocache-index-management-lambda"
  role   = aws_iam_role.biocache_index_management_role.id
  policy = data.aws_iam_policy_document.biocache_index_management_permission.json
}
