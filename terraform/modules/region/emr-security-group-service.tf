resource "aws_security_group" "emr_service_access" {
  name        = "emr-service-access"
  description = "EMR Service Access security group"
  vpc_id      = var.main_vpc_id

  tags = {
    "for-use-with-amazon-emr-managed-policies" : "true"
  }
}

# Service Access - https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-man-sec-groups.html#emr-sg-elasticmapreduce-sa-private
resource "aws_security_group_rule" "service_access_ingress" {
  type                     = "ingress"
  security_group_id        = aws_security_group.emr_service_access.id
  source_security_group_id = aws_security_group.emr_cluster_instances.id
  from_port                = 9443
  to_port                  = 9443
  protocol                 = "tcp"
  description              = "Allow EMR cluster manager to communicate with the primary node."
}

resource "aws_security_group_rule" "service_access_egress" {
  type                     = "egress"
  security_group_id        = aws_security_group.emr_service_access.id
  source_security_group_id = aws_security_group.emr_cluster_instances.id
  from_port                = 8443
  to_port                  = 8443
  protocol                 = "tcp"
  description              = "Allow EMR master instance to communicate with cluster manager."
}