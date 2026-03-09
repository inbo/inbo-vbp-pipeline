resource "aws_iam_service_linked_role" "emr" {
  aws_service_name = "elasticmapreduce.amazonaws.com"
}

resource "aws_iam_role" "iam_emr_service_role" {
  name = "${var.resource_prefix}pipelines-emr-service-role"

  assume_role_policy = data.aws_iam_policy_document.emr_role_assume_policy.json
}

data "aws_iam_policy_document" "emr_role_assume_policy" {
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
      values   = ["arn:aws:elasticmapreduce:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"]
    }
  }
}


// Create custom EMR service policy, so we do not need tags on the subnets and VPC
// https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-iam-role.html

locals {
  network_arns = concat(
    [
      for subnet_id in var.private_subnet_ids :
      "arn:aws:ec2:${var.aws_region}:${data.aws_caller_identity.current.account_id}:subnet/${subnet_id}"
      ], [
      "arn:aws:ec2:${var.aws_region}:${data.aws_caller_identity.current.account_id}:vpc/${var.main_vpc_id}"
  ])
}

data "aws_iam_policy_document" "emr_service_role_main" {
  statement {
    sid    = "CreateInTaggedNetworkWithoutTags"
    effect = "Allow"
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:RunInstances",
      "ec2:CreateFleet",
      "ec2:CreateLaunchTemplate",
      "ec2:CreateLaunchTemplateVersion",
    ]
    resources = local.network_arns

  }
  statement {
    sid    = "CreateInTaggedNetwork"
    effect = "Allow"
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:RunInstances",
      "ec2:CreateFleet",
      "ec2:CreateLaunchTemplate",
      "ec2:CreateLaunchTemplateVersion",
    ]
    resources = [
      "arn:aws:ec2:*:*:security-group/*",
    ]
    condition {
      test     = "StringEquals"
      variable = "aws:ResourceTag/for-use-with-amazon-emr-managed-policies"
      values   = ["true"]
    }
  }

  statement {
    sid    = "CreateWithEMRTaggedLaunchTemplate"
    effect = "Allow"
    actions = [
      "ec2:CreateFleet",
      "ec2:RunInstances",
      "ec2:CreateLaunchTemplateVersion",
    ]
    resources = [
      "arn:aws:ec2:*:*:launch-template/*",
    ]
    condition {
      test     = "StringEquals"
      variable = "aws:ResourceTag/for-use-with-amazon-emr-managed-policies"
      values   = ["true"]
    }
  }

  statement {
    sid    = "CreateEMRTaggedLaunchTemplate"
    effect = "Allow"
    actions = [
      "ec2:CreateLaunchTemplate",
    ]
    resources = [
      "arn:aws:ec2:*:*:launch-template/*",
    ]
    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/for-use-with-amazon-emr-managed-policies"
      values   = ["true"]
    }
  }

  statement {
    sid    = "CreateEMRTaggedInstancesAndVolumes"
    effect = "Allow"
    actions = [
      "ec2:RunInstances",
      "ec2:CreateFleet",
    ]
    resources = [
      "arn:aws:ec2:*:*:instance/*",
      "arn:aws:ec2:*:*:volume/*",
    ]
    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/for-use-with-amazon-emr-managed-policies"
      values   = ["true"]
    }
  }

  statement {
    sid    = "ResourcesToLaunchEC2"
    effect = "Allow"
    actions = [
      "ec2:RunInstances",
      "ec2:CreateFleet",
      "ec2:CreateLaunchTemplate",
      "ec2:CreateLaunchTemplateVersion",
    ]
    resources = [
      "arn:aws:ec2:*:*:network-interface/*",
      "arn:aws:ec2:*::image/ami-*",
      "arn:aws:ec2:*:*:key-pair/*",
      "arn:aws:ec2:*:*:capacity-reservation/*",
      "arn:aws:ec2:*:*:placement-group/pg-*",
      "arn:aws:ec2:*:*:fleet/*",
      "arn:aws:ec2:*:*:dedicated-host/*",
      "arn:aws:resource-groups:*:*:group/*",
    ]
  }

  statement {
    sid    = "ManageEMRTaggedResources"
    effect = "Allow"
    actions = [
      "ec2:CreateLaunchTemplateVersion",
      "ec2:DeleteLaunchTemplate",
      "ec2:DeleteNetworkInterface",
      "ec2:ModifyInstanceAttribute",
      "ec2:TerminateInstances",
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "aws:ResourceTag/for-use-with-amazon-emr-managed-policies"
      values   = ["true"]
    }
  }

  statement {
    sid    = "ManageTagsOnEMRTaggedResources"
    effect = "Allow"
    actions = [
      "ec2:CreateTags",
      "ec2:DeleteTags",
    ]
    resources = [
      "arn:aws:ec2:*:*:instance/*",
      "arn:aws:ec2:*:*:volume/*",
      "arn:aws:ec2:*:*:network-interface/*",
      "arn:aws:ec2:*:*:launch-template/*",
    ]
    condition {
      test     = "StringEquals"
      variable = "aws:ResourceTag/for-use-with-amazon-emr-managed-policies"
      values   = ["true"]
    }
  }

  statement {
    sid    = "CreateNetworkInterfaceNeededForPrivateSubnet"
    effect = "Allow"
    actions = [
      "ec2:CreateNetworkInterface",
    ]
    resources = [
      "arn:aws:ec2:*:*:network-interface/*",
    ]
    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/for-use-with-amazon-emr-managed-policies"
      values   = ["true"]
    }
  }

  statement {
    sid    = "TagOnCreateTaggedEMRResources"
    effect = "Allow"
    actions = [
      "ec2:CreateTags",
    ]
    resources = [
      "arn:aws:ec2:*:*:network-interface/*",
      "arn:aws:ec2:*:*:instance/*",
      "arn:aws:ec2:*:*:volume/*",
      "arn:aws:ec2:*:*:launch-template/*",
    ]
    condition {
      test     = "StringEquals"
      variable = "ec2:CreateAction"
      values = [
        "RunInstances",
        "CreateFleet",
        "CreateLaunchTemplate",
        "CreateNetworkInterface",
      ]
    }
  }

  statement {
    sid    = "TagPlacementGroups"
    effect = "Allow"
    actions = [
      "ec2:CreateTags",
      "ec2:DeleteTags",
    ]
    resources = [
      "arn:aws:ec2:*:*:placement-group/pg-*",
    ]
  }

  statement {
    sid    = "ListActionsForEC2Resources"
    effect = "Allow"
    actions = [
      "ec2:DescribeAccountAttributes",
      "ec2:DescribeCapacityReservations",
      "ec2:DescribeDhcpOptions",
      "ec2:DescribeImages",
      "ec2:DescribeInstances",
      "ec2:DescribeInstanceTypeOfferings",
      "ec2:DescribeLaunchTemplates",
      "ec2:DescribeNetworkAcls",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DescribePlacementGroups",
      "ec2:DescribeRouteTables",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeSubnets",
      "ec2:DescribeVolumes",
      "ec2:DescribeVolumeStatus",
      "ec2:DescribeVpcAttribute",
      "ec2:DescribeVpcEndpoints",
      "ec2:DescribeVpcs",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "CreateDefaultSecurityGroupWithEMRTags"
    effect = "Allow"
    actions = [
      "ec2:CreateSecurityGroup",
    ]
    resources = [
      "arn:aws:ec2:*:*:security-group/*",
    ]
    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/for-use-with-amazon-emr-managed-policies"
      values   = ["true"]
    }
  }

  statement {
    sid    = "CreateDefaultSecurityGroupInVPCWithEMRTagsWithoutTags"
    effect = "Allow"
    actions = [
      "ec2:CreateSecurityGroup",
    ]
    resources = local.network_arns
  }

  statement {
    sid    = "TagOnCreateDefaultSecurityGroupWithEMRTags"
    effect = "Allow"
    actions = [
      "ec2:CreateTags",
    ]
    resources = [
      "arn:aws:ec2:*:*:security-group/*",
    ]
    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/for-use-with-amazon-emr-managed-policies"
      values   = ["true"]
    }
    condition {
      test     = "StringEquals"
      variable = "ec2:CreateAction"
      values   = ["CreateSecurityGroup"]
    }
  }

  statement {
    sid    = "ManageSecurityGroups"
    effect = "Allow"
    actions = [
      "ec2:AuthorizeSecurityGroupEgress",
      "ec2:AuthorizeSecurityGroupIngress",
      "ec2:RevokeSecurityGroupEgress",
      "ec2:RevokeSecurityGroupIngress",
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "aws:ResourceTag/for-use-with-amazon-emr-managed-policies"
      values   = ["true"]
    }
  }

  statement {
    sid    = "CreateEMRPlacementGroups"
    effect = "Allow"
    actions = [
      "ec2:CreatePlacementGroup",
    ]
    resources = [
      "arn:aws:ec2:*:*:placement-group/pg-*",
    ]
  }

  statement {
    sid    = "DeletePlacementGroups"
    effect = "Allow"
    actions = [
      "ec2:DeletePlacementGroup",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "AutoScaling"
    effect = "Allow"
    actions = [
      "application-autoscaling:DeleteScalingPolicy",
      "application-autoscaling:DeregisterScalableTarget",
      "application-autoscaling:DescribeScalableTargets",
      "application-autoscaling:DescribeScalingPolicies",
      "application-autoscaling:PutScalingPolicy",
      "application-autoscaling:RegisterScalableTarget",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "ResourceGroupsForCapacityReservations"
    effect = "Allow"
    actions = [
      "resource-groups:ListGroupResources",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "AutoScalingCloudWatch"
    effect = "Allow"
    actions = [
      "cloudwatch:PutMetricAlarm",
      "cloudwatch:DeleteAlarms",
      "cloudwatch:DescribeAlarms",
    ]
    resources = [
      "arn:aws:cloudwatch:*:*:alarm:*_EMR_Auto_Scaling",
    ]
  }

  statement {
    sid    = "PassRoleForAutoScaling"
    effect = "Allow"
    actions = [
      "iam:PassRole",
    ]
    resources = [
      "arn:aws:iam::*:role/EMR_AutoScaling_DefaultRole",
    ]
    condition {
      test     = "StringLike"
      variable = "iam:PassedToService"
      values   = ["application-autoscaling.amazonaws.com*"]
    }
  }

  statement {
    sid    = "PassRoleForEC2"
    effect = "Allow"
    actions = [
      "iam:PassRole",
    ]
    resources = [
      "arn:aws:iam::*:role/EMR_EC2_DefaultRole",
    ]
    condition {
      test     = "StringLike"
      variable = "iam:PassedToService"
      values   = ["ec2.amazonaws.com*"]
    }
  }

  statement {
    sid    = "CreateAndModifyEmrServiceVPCEndpointWithoutTags"
    effect = "Allow"
    actions = [
      "ec2:ModifyVpcEndpoint",
      "ec2:CreateVpcEndpoint",
    ]
    resources = local.network_arns

  }
  statement {
    sid    = "CreateAndModifyEmrServiceVPCEndpoint"
    effect = "Allow"
    actions = [
      "ec2:ModifyVpcEndpoint",
      "ec2:CreateVpcEndpoint",
    ]
    resources = [
      "arn:aws:ec2:*:*:vpc-endpoint/*",
      "arn:aws:ec2:*:*:security-group/*",
    ]
    condition {
      test     = "StringEquals"
      variable = "aws:ResourceTag/for-use-with-amazon-emr-managed-policies"
      values   = ["true"]
    }
  }

  statement {
    sid    = "CreateEmrServiceVPCEndpoint"
    effect = "Allow"
    actions = [
      "ec2:CreateVpcEndpoint",
    ]
    resources = [
      "arn:aws:ec2:*:*:vpc-endpoint/*",
    ]
    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/for-use-with-amazon-emr-managed-policies"
      values   = ["true"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/Name"
      values   = ["emr-service-vpce"]
    }
  }

  statement {
    sid    = "TagEmrServiceVPCEndpoint"
    effect = "Allow"
    actions = [
      "ec2:CreateTags",
    ]
    resources = [
      "arn:aws:ec2:*:*:vpc-endpoint/*",
    ]
    condition {
      test     = "StringEquals"
      variable = "ec2:CreateAction"
      values   = ["CreateVpcEndpoint"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/for-use-with-amazon-emr-managed-policies"
      values   = ["true"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/Name"
      values   = ["emr-service-vpce"]
    }
  }
}

resource "aws_iam_role_policy" "emr_service_role_main" {
  name   = "${var.resource_prefix}pipelines-emr-service-policy"
  role   = aws_iam_role.iam_emr_service_role.id
  policy = data.aws_iam_policy_document.emr_service_role_main.json
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
      values   = ["ec2.amazonaws.com*"]
    }
  }
}

resource "aws_iam_role_policy" "emr_service_role" {
  name   = "${var.resource_prefix}pipelines-emr-pass-ec2-instance-role"
  policy = data.aws_iam_policy_document.emr_service_role.json
  role   = aws_iam_role.iam_emr_service_role.id
}
