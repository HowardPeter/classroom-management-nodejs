variable "project_name" {
  type    = string
  default = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "cloudwatch_log_group" {
  description = "ARN of Cloudwatch API Gateway log group"
  type        = string
  default     = ""
}

variable "api_routes" {
  description = "Corresponding routes for Lambda functions"
  type = map(object({
    prefix_path       = string
    lambda_invoke_arn = string
    lambda_arn        = string
  }))
  default = {}
}