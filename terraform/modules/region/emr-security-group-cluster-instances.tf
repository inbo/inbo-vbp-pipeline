# Primary nodes - https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-man-sec-groups.html#emr-sg-elasticmapreduce-master-private
resource "aws_security_group" "emr_cluster_instances" {
  name        = "emr-cluster-instances"
  description = "EMR EC2 primary cluster instances security group"
  vpc_id      = var.main_vpc_id

  tags = {
    "for-use-with-amazon-emr-managed-policies" : "true"
  }
}

## Ingress

resource "aws_security_group_rule" "allow_all_internal_traffic" {
  type                     = "ingress"
  security_group_id        = aws_security_group.emr_cluster_instances.id
  source_security_group_id = aws_security_group.emr_cluster_instances.id
  from_port                = -1
  to_port                  = -1
  protocol                 = -1
  description              = "Allow all traffic within the security group itself."
}

resource "aws_security_group_rule" "emr_cluster_manager_ingress" {
  type                     = "ingress"
  security_group_id        = aws_security_group.emr_cluster_instances.id
  source_security_group_id = aws_security_group.emr_service_access.id
  from_port                = 8443
  to_port                  = 8443
  protocol                 = "tcp"
  description              = "Allow EMR cluster manager to communicate with the primary node."
}

## Egress
# Required for some kind of bootstrap action ... no idea what ... node-provisioner connect times out?
resource "aws_security_group_rule" "emr_master_internet_access" {
  type              = "egress"
  security_group_id = aws_security_group.emr_cluster_instances.id
  from_port         = -1
  to_port           = -1
  protocol          = -1
  cidr_blocks       = ["0.0.0.0/0"] #tfsec:ignore:aws-ec2-no-public-egress-sgr
  description       = "Allow EMR master instance to communicate with the internet."
}

resource "aws_security_group_rule" "emr_master_cluster_manager_egress_1" {
  type              = "egress"
  security_group_id = aws_security_group.emr_cluster_instances.id
  source_security_group_id = aws_security_group.emr_service_access.id
  from_port         = 9443
  to_port           = 9443
  protocol          = "tcp"
  description       = "Allow EMR master instance to communicate with cluster manager."
}


resource "aws_security_group_rule" "emr_master_cluster_manager_egress_2" {
  type              = "egress"
  security_group_id = aws_security_group.emr_cluster_instances.id
  source_security_group_id = aws_security_group.emr_service_access.id
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  description       = "Allow EMR master instance to communicate with cluster manager."
}
