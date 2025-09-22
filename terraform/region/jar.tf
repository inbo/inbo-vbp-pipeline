resource "null_resource" "pipeline-jar" {
  triggers = {
    pipeline_version = var.docker_version
  }

  provisioner "local-exec" {
    command = <<EOF
set -e -o pipefail

$(aws sts assume-role --role-arn ${var.aws_iam_role} --role-session-name tf-${var.application}-upload-branding --query 'Credentials.[`export#AWS_ACCESS_KEY_ID=`,AccessKeyId,`#AWS_SECRET_ACCESS_KEY=`,SecretAccessKey,`#AWS_SESSION_TOKEN=`,SessionToken]' --output text | sed $'s/\t//g' | sed 's/#/ /g')

docker login -u AWS -p $(aws ecr get-login-password) ${var.ecr_repo}

# Just in case the previous run was not cleaned up correctly
docker rm -v download-pipeline-jar || true

# Copy jar from th docker image
docker create --name download-pipeline-jar ${var.ecr_repo}/${var.resource_prefix}pipelines:${var.docker_version}
docker cp download-pipeline-jar:/app/livingatlas/pipelines/target/pipelines-2.18.6-SNAPSHOT-shaded.jar ./pipelines-${var.docker_version}.jar

# Upload jar to S3
aws s3 cp ./pipelines-${var.docker_version}.jar s3://${aws_s3_bucket.pipelines.bucket}/pipelines-${var.docker_version}.jar

# Clean up
docker rm -v download-pipeline-jar
rm ./pipelines-${var.docker_version}.jar
EOF
  }
}

data "aws_ecr_authorization_token" "token" {
}