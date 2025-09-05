data "aws_secretsmanager_random_password" "apikey_credentials" {
  password_length     = 20
  exclude_punctuation = true
}

resource "aws_secretsmanager_secret" "apikey_credentials" {
  name                    = "/inbo/${var.application}/pipelines"
  recovery_window_in_days = 0

  kms_key_id = var.secrets_kms_key_arn
}

resource "aws_secretsmanager_secret_version" "apikey_credentials" {
  secret_id     = aws_secretsmanager_secret.apikey_credentials.id
  secret_string = data.aws_secretsmanager_random_password.apikey_credentials.random_password

  lifecycle {
    ignore_changes = [secret_string,]
  }
}
