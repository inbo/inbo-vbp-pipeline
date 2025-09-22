data "aws_iam_policy_document" "batch_assume_policy" {
  statement {
    effect = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type = "Service"
      identifiers = [
        "ecs-tasks.amazonaws.com",
        "batch.amazonaws.com"
      ]
    }
  }
}

# Allow signing in from iam in root account
resource "aws_iam_role" "batch_task_execution_role" {
  name = "${var.resource_prefix}pipelines-batch-exec-role"

  assume_role_policy = data.aws_iam_policy_document.batch_assume_policy.json
}

resource "aws_iam_role" "batch_task_role" {
  name = "${var.resource_prefix}pipelines-batch-role"

  assume_role_policy = data.aws_iam_policy_document.batch_assume_policy.json
}

############################################################
# Policy to allow pulling ECR image from INBO-SHARED_INFRA #
############################################################
data "aws_iam_policy_document" "batch" {
  statement {
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:GetRepositoryPolicy",
      "ecr:DescribeRepositories"
    ]
    resources = [
      "arn:aws:ecr:${split(".", var.ecr_repo)[3]}:${split(".", var.ecr_repo)[0]}:repository/${var.resource_prefix}pipelines",
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
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
      "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:${var.log_group_name}:log-stream:batch/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "ssmmessages:CreateControlChannel",
      "ssmmessages:CreateDataChannel",
      "ssmmessages:OpenControlChannel",
      "ssmmessages:OpenDataChannel"
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
    ]
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
      values = [
        "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:/${var.organisation}/${var.application}/pipelines-*"
      ]
      variable = "kms:EncryptionContext:SecretARN"
    }
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:GetBucketLocation",
      "s3:ListBucket",
      "s3:ListBucketMultipartUploads"
    ]
    resources = ["arn:aws:s3:::${var.resource_prefix}${var.aws_env}-pipelines"]
  }
  statement {
    effect = "Allow"
    actions = [
      "s3:AbortMultipartUpload",
      "s3:GetObject",
      "s3:GetObjectTagging",
      "s3:GetObjectVersion",
      "s3:GetObjectVersionTagging",
      "s3:ListMultipartUploadParts"
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:s3:::${var.resource_prefix}${var.aws_env}-pipelines/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
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

resource "aws_iam_role_policy" "batch_task_role" {
  name   = "${var.resource_prefix}batch-task"
  policy = data.aws_iam_policy_document.batch.json
  role   = aws_iam_role.batch_task_role.id
}

resource "aws_iam_role_policy" "batch_task_execution_role" {
  name   = "${var.resource_prefix}batch-task-execution"
  policy = data.aws_iam_policy_document.batch.json
  role   = aws_iam_role.batch_task_execution_role.id
}
