data "aws_iam_policy_document" "step_function_assume_role_sf" {
  statement {
    effect = "Allow"

    principals {
      type = "Service"
      identifiers = ["states.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "pipeline" {
  name = "${var.resource_prefix}pipeline-step-function"

  assume_role_policy = data.aws_iam_policy_document.step_function_assume_role_sf.json
}

data "aws_iam_policy_document" "pipeline" {
  statement {
    effect = "Allow"

    actions = [
      "states:InvokeHTTPEndpoint"
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:states:${var.aws_region}:${data.aws_caller_identity.current.account_id}:stateMachine:${var.resource_prefix}pipelines*"
    ]

    condition {
      test     = "StringEquals"
      variable = "states:HTTPMethod"
      values = ["GET"]
    }

    condition {
      test     = "StringLike"
      variable = "states:HTTPEndpoint"
      values = ["https://${var.base_domain}/*", "http://solr.vbp.internal:8983/solr*"]
    }
  }

  statement {
    effect = "Allow"

    actions = [
      "events:RetrieveConnectionCredentials"
    ]

    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:events:${var.aws_region}:${data.aws_caller_identity.current.account_id}:connection/${var.resource_prefix}pipelines-step-function/*",
      "arn:aws:events:${var.aws_region}:${data.aws_caller_identity.current.account_id}:connection/${var.resource_prefix}pipelines-step-function-oauth-connection/*"
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:/${var.organisation}/${var.application}/pipelines-*",
      "arn:aws:secretsmanager:*:*:secret:events!connection/*"
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "elasticmapreduce:RunJobFlow",
      "elasticmapreduce:TerminateJobFlows",
      "elasticmapreduce:DescribeCluster",
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = ["*"]
  }

  statement {
    effect = "Allow"

    actions = [
      "elasticmapreduce:AddJobFlowSteps",
      "elasticmapreduce:DescribeStep",
      "elasticmapreduce:CancelSteps",
      "elasticmapreduce:AddTags"
    ]

    #tfsec:ignore:aws-iam-no-policy-wildcards - clusters are dynamically created, no way to know exact cluster-id
    resources = ["arn:aws:elasticmapreduce:${var.aws_region}:${data.aws_caller_identity.current.account_id}:cluster/*"]
  }

  statement {
    effect = "Allow"

    actions = [
      "iam:PassRole"
    ]

    resources = [aws_iam_role.iam_emr_instance_role.arn, aws_iam_role.iam_emr_service_role.arn, aws_iam_role.iam_emr_scaling_role.arn]
  }

  statement {
    effect = "Allow"

    actions = [
      "batch:SubmitJob",
      "batch:TerminateJob",
      "batch:DescribeJobs",
    ]

    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:batch:${var.aws_region}:${data.aws_caller_identity.current.account_id}:job-definition/delete-data-resource-data:*",
      "arn:aws:batch:${var.aws_region}:${data.aws_caller_identity.current.account_id}:job-definition/download-data-resources:*",
      "arn:aws:batch:${var.aws_region}:${data.aws_caller_identity.current.account_id}:job-definition/dwca-to-index:*",
      "arn:aws:batch:${var.aws_region}:${data.aws_caller_identity.current.account_id}:job-definition/index-to-solr:*",
      "arn:aws:batch:${var.aws_region}:${data.aws_caller_identity.current.account_id}:job-definition/spatial-sampling:*",
      "arn:aws:batch:${var.aws_region}:${data.aws_caller_identity.current.account_id}:job-queue/${var.resource_prefix}pipelines"
    ]
  }

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
      "arn:aws:states:${var.aws_region}:${data.aws_caller_identity.current.account_id}:stateMachine:${var.resource_prefix}pipelines*",
      "arn:aws:states:${var.aws_region}:${data.aws_caller_identity.current.account_id}:execution:${var.resource_prefix}pipelines*:*",
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "events:PutTargets",
      "events:PutRule",
      "events:DescribeRule"
    ]
    resources = [
      "arn:aws:events:${var.aws_region}:${data.aws_caller_identity.current.account_id}:rule/StepFunctionsGetEventsForBatchJobsRule",
      "arn:aws:events:${var.aws_region}:${data.aws_caller_identity.current.account_id}:rule/StepFunctionsGetEventsForStepFunctionsExecutionRule"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query"
    ]
    resources = [
      "arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/${var.resource_prefix}pipelines"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetObject"
    ]
    resources = [
      "arn:aws:s3:::${var.resource_prefix}${var.aws_env}-pipelines",
      "arn:aws:s3:::${var.resource_prefix}${var.aws_env}-pipelines/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/${var.resource_prefix}*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "sqs:ReceiveMessage",
      "sqs:SendMessage"
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:sqs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${var.resource_prefix}pipeline-lock-*",
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "lambda:InvokeFunction",
    ]
    resources = [
      "arn:aws:lambda:${var.aws_region}:${data.aws_caller_identity.current.account_id}:function:${var.resource_prefix}biocache-index-management:*",
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "kms:Decrypt",
    ]
    resources = [var.dynamodb_kms_key_arn]
  }


  statement {
    effect = "Allow"
    actions = [
      "xray:PutTraceSegments",
      "xray:PutTelemetryRecords",
      "xray:GetSamplingRules",
      "xray:GetSamplingTargets"
    ]
    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "*"
    ]
  }
}

resource "aws_iam_role_policy" "pipeline" {
  name   = "${var.application}-pipeline-policy"
  role   = aws_iam_role.pipeline.id
  policy = data.aws_iam_policy_document.pipeline.json
}