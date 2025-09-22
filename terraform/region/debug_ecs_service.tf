resource "aws_ecs_task_definition" "deployment" {
  family = "${var.application}-${var.name}"
  cpu    = 1024
  memory = 4096

  container_definitions = jsonencode([
    {
      name      = var.name
      image     = "${var.ecr_repo}/${var.resource_prefix}pipelines:${var.docker_version}"
      user      = var.user
      essential = true
      entrypoint = ["sleep", "999999"]
      environment = concat([
        #         {
        #           name  = "LOG_LEVEL",
        #           value = "DEBUG"
        #         },
        {
          name  = "LOG_FORMAT",
          value = "TEXT"
        },
        {
          name  = "SPRING_PROFILES_ACTIVE"
          value = "production"
        }
      ], var.environment)
      secrets = var.secrets

      mountPoints = [
        {
          sourceVolume  = "data"
          containerPath = "/data"
          readOnly      = false
        }
      ]
    },
  ])

  volume {
    name = "data"
    efs_volume_configuration {
      file_system_id          = aws_efs_file_system.data_volume.id
      transit_encryption      = "ENABLED"
      transit_encryption_port = 2049
      authorization_config {
        access_point_id = aws_efs_access_point.data_volume.id
        iam             = "ENABLED"
      }
    }
  }

  task_role_arn      = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipelines-batch-role"
  execution_role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipelines-batch-role"
  network_mode       = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }
}


resource "aws_ecs_service" "deployment" {
  cluster                            = var.ecs_cluster_arn
  name                               = var.name
  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100
  enable_execute_command = true # allow exec with iam user
  desired_count                      = 0
  enable_ecs_managed_tags            = true
  launch_type                        = "FARGATE"
  task_definition                    = aws_ecs_task_definition.deployment.arn
  propagate_tags                     = "SERVICE"

  deployment_controller {
    type = "ECS"
  }

  network_configuration {
    security_groups = [aws_security_group.batch.id]
    assign_public_ip = false
    subnets          = var.private_subnet_ids
  }
}

