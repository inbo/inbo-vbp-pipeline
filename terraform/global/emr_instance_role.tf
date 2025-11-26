# IAM Role for EC2 Instance Profile
data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "iam_emr_instance_role" {
  name = "${var.resource_prefix}pipelines-emr-instance-role"

  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}

resource "aws_iam_instance_profile" "emr_profile" {
  name = "${var.resource_prefix}pipelines-emr-instance-profile"

  role = aws_iam_role.iam_emr_instance_role.name
}

data "aws_iam_policy_document" "iam_emr_instance_profile_policy" {
  # TODO: required to get access to the elasticmapreduce bucket hosting script-runner.jar
  statement {
    effect = "Allow"

    actions = [
      "s3:ListBucket",
      "s3:GetObject",
    ]

    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "*"
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "s3:ListBucket",
      "s3:GetObject",
    ]

    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:s3:::elasticmapreduce",
      "arn:aws:s3:::elasticmapreduce/*"
    ]
  }


  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:s3:::${var.resource_prefix}${var.aws_env}-pipelines",
      "arn:aws:s3:::${var.resource_prefix}${var.aws_env}-pipelines/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:AbortMultipartUpload",
      "s3:GetObject",
      "s3:GetObjectTagging",
      "s3:GetObjectVersion",
      "s3:GetObjectVersionTagging",
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:s3:::${var.resource_prefix}${var.aws_env}-pipelines/data/*"
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "s3:PutObject",
    ]

    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = ["arn:aws:s3:::${var.resource_prefix}${var.aws_env}-pipelines/logs/*"]
  }

  statement {
    effect = "Allow"

    actions = [
      "s3:PutObject",
    ]

    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = ["arn:aws:s3:::${var.resource_prefix}${var.aws_env}-pipelines/logs/*"]
  }


  statement {
    effect = "Allow"
    actions = ["ssm:DescribeParameters"]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "ssm:GetParameters",
      "ssm:GetParameter",
      "ssm:GetParametersByPath"
    ]
    resources = [
      "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/EMRCloudwatchConfig.json"
    ]
  }

  # Needed to allow ssm ssh sessions
  statement {
    effect = "Allow"
    actions = [
      "kms:Decrypt"
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:${var.log_group_name}",
      "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:${var.log_group_name}:log-stream:emr/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:/${var.organisation}/${var.application}/pipelines-*"
    ]
  }
  statement {
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:GenerateDataKey"
    ]
    resources = [var.secrets_kms_key_arn]
    condition {
      test = "StringLike"
      #tfsec:ignore:aws-iam-no-policy-wildcards
      values = [
        "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:/${var.organisation}/${var.application}/pipelines-*"
      ]
      variable = "kms:EncryptionContext:SecretARN"
    }
  }
}

resource "aws_iam_role_policy" "iam_emr_instance_profile_policy" {
  name   = "iam_emr_instance_profile_policy"
  role   = aws_iam_role.iam_emr_instance_role.id
  policy = data.aws_iam_policy_document.iam_emr_instance_profile_policy.json
}

resource "aws_iam_role_policy_attachment" "ssm_managed_instance_core" {
  role       = aws_iam_role.iam_emr_instance_role.id
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}