variable "project_name" {
  type    = string
  default = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "ecr_enabled" {
  description = "Whether ECR created and had pushed image"
  type        = bool
  default     = false
}

variable "lambda_services" {
  description = "Lambda function configs"
  type = map(object({
    image         = string
    memory        = number
    timeout       = number
    architectures = list(string)
    environment   = map(any)
  }))
}

variable "s3_arn" {
  description = "ARN of S3 bucket storing profile image"
  type        = string
  default     = ""
}

variable "auth_secret_arn" {
  description = "ARN of secret manager - auth secret"
  type        = string
  default     = ""
}

variable "public_key_secret_arn" {
  description = "ARN of secret manager - public token secret"
  type        = string
  default     = ""
}

variable "supabase_secret_arns" {
  description = "ARN of secret manager (supabase services)"
  type        = map(string)
  default     = {}
}

variable "vpc_subnet_ids" {
  description = "List of VPC subnet IDs for Lambda functions"
  type        = list(string)
  default     = []
}

variable "vpc_security_group_ids" {
  description = "List of VPC security group IDs for Lambda functions"
  type        = list(string)
  default     = []
}

variable "invoke_permissions" {
  description = "Map of which lambda services can invoke which services"
  type        = map(list(string))
  default     = {}
}