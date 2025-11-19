variable "TAG" {
  default = "dev"
}

variable "CACHE_TAG" {
  default = "dev"
}

variable "DOCKER_REPO" {
  default = "local"
}

target "pipeline-batch-runner" {
  context = "./pipelines"
  cache-from = ["${DOCKER_REPO}/inbo-vbp-pipelines:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-pipelines:${TAG}"]
}

