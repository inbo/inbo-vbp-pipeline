#tfsec:ignore:aws-sqs-enable-queue-encryption
resource "aws_sqs_queue" "lock-queues" {
  for_each = toset(["download", "index", "sample", "solr"])

  name = "${var.resource_prefix}pipeline-lock-${each.value}"

  message_retention_seconds = 60
}

# Shared DLQ for the pipeline lambda (Prowler awslambda_function_no_dead_letter_queue).
# Never fires in practice: ALB and Step Functions invoke synchronously, DLQ only applies to async invokes.
#tfsec:ignore:aws-sqs-enable-queue-encryption
resource "aws_sqs_queue" "lambda_dlq" {
  name = "${var.resource_prefix}lambda-dlq"

  message_retention_seconds = 1209600
}
