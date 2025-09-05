resource "aws_efs_file_system" "data_volume" {
  creation_token = "inbo-${var.application}-${var.name}-data"
  encrypted      = true

  tags = {
    "Name" = "inbo-${var.application}-${var.name}-data"
  }

  kms_key_id = var.efs_kms_key_arn
}

data "aws_iam_policy_document" "data_volume" {
  statement {
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    actions = [
      "elasticfilesystem:ClientRootAccess",
      "elasticfilesystem:ClientWrite",
      "elasticfilesystem:ClientMount"
    ]
    resources = [aws_efs_file_system.data_volume.arn]
    condition {
      test     = "Bool"
      variable = "elasticfilesystem:AccessedViaMountTarget"
      values   = ["true"]
    }
  }

  statement {
    effect  = "Deny"
    actions = ["*"]
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    resources = [aws_efs_file_system.data_volume.arn]
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_efs_file_system_policy" "data_volume" {
  file_system_id                     = aws_efs_file_system.data_volume.id
  bypass_policy_lockout_safety_check = false
  policy                             = data.aws_iam_policy_document.data_volume.json
}

resource "aws_efs_access_point" "data_volume" {
  file_system_id = aws_efs_file_system.data_volume.id
  root_directory {
    path = "/data"
    creation_info {
      owner_gid   = 1000
      owner_uid   = 1000
      permissions = 755
    }
  }

  posix_user {
    gid = 1000
    uid = 1000
  }
}

resource "aws_efs_mount_target" "data_volume_private_subnet_1" {
  for_each = toset(var.private_subnet_ids)

  file_system_id  = aws_efs_file_system.data_volume.id
  subnet_id       = each.value
  security_groups = [aws_security_group.efs_volumes.id]
}