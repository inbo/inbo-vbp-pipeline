resource "aws_iam_service_linked_role" "emr" {
  aws_service_name = "elasticmapreduce.amazonaws.com"
}

resource "aws_iam_role" "iam_emr_service_role" {
  name = "${var.resource_prefix}pipelines-emr-service-role"

  assume_role_policy = data.aws_iam_policy_document.emr_role_assume_policy.json
}

data "aws_iam_policy_document" "emr_role_assume_policy" {
  statement {
    effect = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type = "Service"
      identifiers = ["elasticmapreduce.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values = [data.aws_caller_identity.current.id]
    }
    condition {
      test     = "ArnLike"
      variable = "aws:SourceArn"
      values = ["arn:aws:elasticmapreduce:${var.aws_region}:${data.aws_caller_identity.current.id}:*"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "iam_emr_service_role_default_policy" {
  role       = aws_iam_role.iam_emr_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEMRServicePolicy_v2"
}

data "aws_iam_policy_document" "emr_service_role" {
  statement {
    effect = "Allow"

    actions = [
      "iam:PassRole"
    ]

    resources = [aws_iam_role.iam_emr_instance_role.arn]

    condition {
      test     = "StringLike"
      variable = "iam:PassedToService"
      values = ["ec2.amazonaws.com*"]
    }
  }
}

resource "aws_iam_role_policy" "emr_service_role" {
  name   = "${var.resource_prefix}pipelines-emr-pass-ec2-instance-role"
  policy = data.aws_iam_policy_document.emr_service_role.json
  role   = aws_iam_role.iam_emr_service_role.id
}
