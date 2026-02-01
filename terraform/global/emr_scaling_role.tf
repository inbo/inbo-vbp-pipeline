resource "aws_iam_role" "iam_emr_scaling_role" {
  name = "${var.resource_prefix}pipelines-emr-scaling-role"

  assume_role_policy = data.aws_iam_policy_document.emr_scaling_role_assume_policy.json
}

data "aws_iam_policy_document" "emr_scaling_role_assume_policy" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["elasticmapreduce.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [data.aws_caller_identity.current.account_id]
    }
    condition {
      test     = "ArnLike"
      variable = "aws:SourceArn"
      values   = ["arn:aws:elasticmapreduce:${var.aws_region}:${data.aws_caller_identity.current.account_id}:cluster/*"]
    }
  }
}

data "aws_iam_policy_document" "emr_scaling_role" {
  statement {
    effect = "Allow"

    actions = [
      "cloudwatch:DescribeAlarms",
      "elasticmapreduce:ListInstanceGroups",
      "elasticmapreduce:ModifyInstanceGroups"
    ]

    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "emr_scaling_role" {
  name   = "${var.resource_prefix}pipelines-emr-scaling-role"
  policy = data.aws_iam_policy_document.emr_scaling_role.json
  role   = aws_iam_role.iam_emr_scaling_role.id
}
