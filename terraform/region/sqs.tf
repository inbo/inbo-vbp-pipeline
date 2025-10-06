#tfsec:ignore:aws-sqs-enable-queue-encryption
resource "aws_sqs_queue" "lock-queues" {
  for_each = toset(["sample", "solr"])

  name = "${var.resource_prefix}pipeline-lock-${each.value}"

  message_retention_seconds = 60
}
