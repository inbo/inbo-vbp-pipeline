resource "aws_security_group" "batch" {
  name        = "${var.resource_prefix}sgr-${var.name}-batch"
  description = "Security Group for ${var.name} ecs container"
  vpc_id      = var.main_vpc_id

  tags = {
    "for-use-with-amazon-emr-managed-policies" : "true"
  }
}

resource "aws_security_group" "efs_volumes" {
  name        = "${var.resource_prefix}sgr-${var.name}-efs-volumes"
  description = "Securty Group for EFS"
  vpc_id      = var.main_vpc_id
}

resource "aws_security_group_rule" "efs_volume_config_allow_efs_ingress_from_backend" {
  type                     = "ingress"
  security_group_id        = aws_security_group.efs_volumes.id
  source_security_group_id = aws_security_group.batch.id
  from_port                = 2049
  to_port                  = 2049
  protocol                 = "tcp"
  description              = "allow efs from ${var.application} backend to efs media filesystem"
}

resource "aws_security_group_rule" "backend_allow_efs_egress_to_efs_filesystem_config" {
  type                     = "egress"
  security_group_id        = aws_security_group.batch.id
  source_security_group_id = aws_security_group.efs_volumes.id
  from_port                = 2049
  to_port                  = 2049
  protocol                 = "tcp"
  description              = "allow efs from ${var.application} backend to efs"
}

resource "aws_security_group_rule" "backend_allow_https_egress_to_internet" {
  type              = "egress"
  security_group_id = aws_security_group.batch.id
  cidr_blocks       = ["0.0.0.0/0"] #tfsec:ignore:aws-ec2-no-public-egress-sgr
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  description       = "allow https from ${var.application} backend to internet for secrets manager"
}



resource "aws_security_group_rule" "backend_allow_https_egress_to_meise" {
  type              = "egress"
  security_group_id = aws_security_group.batch.id
  cidr_blocks       = ["0.0.0.0/0"] #tfsec:ignore:aws-ec2-no-public-egress-sgr
  from_port         = 8443
  to_port           = 8443
  protocol          = "tcp"
  description       = "allow https from ${var.application} backend to internet meise ipt https port"
}

# # TODO remove once we have certificates
# resource "aws_security_group_rule" "backend_allow_http_egress_to_internet" {
#   type              = "egress"
#   security_group_id = aws_security_group.batch.id
#   cidr_blocks       = ["0.0.0.0/0"] #tfsec:ignore:aws-ec2-no-public-egress-sgr
#   from_port         = 80
#   to_port           = 80
#   protocol          = "tcp"
#   description       = "allow https from ${var.application} backend to internet for secrets manager"
# }
