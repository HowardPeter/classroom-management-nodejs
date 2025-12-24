variable "project_name" {
  type    = string
  default = ""
}

variable "region" {
  type    = string
  default = "ap-southeast-1"
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "email" {
  description = "SNS email that CloudWatch alarm will send notification"
  type        = string
  default     = ""
}

variable "function_name" {
  description = "Lambda function name"
  type = object({
    auth    = string
    class   = string
    student = string
    tuition = string
    teacher = string
  })
}

variable "cache_serverless_name" {
  description = "ElastiCache name"
  type        = string
  default     = ""
}

variable "apigw" {
  description = "API Gateway values"
  type = object({
    api_name  = string
    api_id    = string
    api_stage = string
  })
}