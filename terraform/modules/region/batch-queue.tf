resource "aws_batch_compute_environment" "fargate" {
  compute_environment_name = "inbo-${var.application}-pipelines"

  compute_resources {
    max_vcpus = 16

    security_group_ids = [
      aws_security_group.batch.id
    ]

    subnets = var.private_subnet_ids

    type = "FARGATE"
  }

  service_role = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/inbo-${var.application}-pipelines-batch-service-role"
  type         = "MANAGED"
}

resource "aws_batch_compute_environment" "fargate_spot" {
  compute_environment_name = "inbo-${var.application}-pipelines-spot"

  compute_resources {
    max_vcpus = 16

    security_group_ids = [
      aws_security_group.batch.id
    ]

    subnets = var.private_subnet_ids

    type = "FARGATE_SPOT"
  }

  service_role = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/inbo-${var.application}-pipelines-batch-service-role"
  type         = "MANAGED"
}

resource "aws_batch_job_queue" "pipelines_queue" {
  name     = "inbo-${var.application}-pipelines"
  state    = "ENABLED"
  priority = 1

  compute_environment_order {
    order               = 1
    compute_environment = aws_batch_compute_environment.fargate_spot.arn
  }

  compute_environment_order {
    order               = 2
    compute_environment = aws_batch_compute_environment.fargate.arn
  }
}