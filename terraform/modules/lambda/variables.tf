variable "project_name" {
  type    = string
  default = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "lambda_services" {
  description = "Lambda function configs"
  type = map(object({
    image         = string
    memory        = string
    timeout       = string
    architectures = set(string)
    environment   = map(string)
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