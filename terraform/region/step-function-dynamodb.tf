#tfsec:ignore:aws-dynamodb-enable-recovery
resource "aws_dynamodb_table" "biodiversiteitsportaal_pipelines" {
  name = "inbo-${var.application}-pipelines"

  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "PK"
  range_key = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  ttl {
    attribute_name = "TTL"
    enabled        = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.dynamodb_kms_key_arn
  }

  point_in_time_recovery {
    enabled = true
  }
}