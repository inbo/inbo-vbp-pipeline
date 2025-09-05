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

resource "aws_iam_role" "solr_management_role" {
  name = "inbo-${var.application}-solr-management-lambda"

  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

data "aws_iam_policy_document" "solr_management_permission" {
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
      "ec2:DescribeVpcs",
    ]

    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "*"
    ]
  }
  statement {
    effect = "Allow"

    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DeleteNetworkInterface",
      "ec2:AttachNetworkInterface",
      "ec2:UnassignPrivateIpAddresses",
      "ec2:AssignPrivateIpAddresses",
    ]

    resources = [
      for subnet_id in var.private_subnet_ids :
      "arn:aws:ec2:${var.aws_region}:${data.aws_caller_identity.current.account_id}:subnet/${subnet_id}"
    ]
  }
}

resource "aws_iam_role_policy" "solr-management" {
  name   = "solr-management-lambda"
  role   = aws_iam_role.solr_management_role.id
  policy = data.aws_iam_policy_document.solr_management_permission.json
}
