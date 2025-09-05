output "name" {
  value = var.name
}

output "deployment_security_group_id" {
  value = aws_security_group.batch.id
}

output "aws_batch_job_definition_arn" {
  value = aws_batch_job_definition.la_pipelines.arn
}

output "aws_batch_job_queue_arn" {
  value = aws_batch_job_queue.pipelines_queue.arn
}

output "cluster_security_group_id" {
  value = aws_security_group.emr_cluster_instances.id
}

output "piplines_api_key_secret_arn" {
  value = aws_secretsmanager_secret.apikey_credentials.arn
}

output "pipelines_s3_bucket_name" {
  value = aws_s3_bucket.pipelines.bucket
}