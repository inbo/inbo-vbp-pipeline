resource "aws_scheduler_schedule" "weekly_indexing" {
  name       = "Schedule-indexing"
  group_name = var.resource_prefix

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression = "cron(0 0 * * SAT)"

  target {
    arn      = aws_sfn_state_machine.pipeline.arn
    role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.resource_prefix}pipeline-step-function"
  }
}
