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
}

resource "aws_iam_role_policy" "solr-management" {
  name   = "solr-management-lambda"
  role   = aws_iam_role.solr_management_role.id
  policy = data.aws_iam_policy_document.solr_management_permission.json
}
