variable "aws_region" {
  type    = string
  default = "ap-southeast-1"
}

# VARIABLES CHUNG
variable "project_name" {
  description = "Project prefix name"
  type        = string
  default     = "classroom-mg"
}

variable "tags" {
  description = "Tags for AWS resources"
  type        = map(string)
  default = {
    Environment = "prod"
    Project     = "classroom-mg"
  }
}

variable "ecr_enabled" {
  description = "True when all ECR repos have its image"
  type        = bool
  default     = true
}

# SECRET MANAGER VARIABLES
variable "auth" {
  type = object({
    mongo_username       = string
    mongo_password       = string
    mongo_host           = string
    private_key          = string
    refresh_token_secret = string
  })
  sensitive = true
}

# Supabase service secret value
variable "student_db_url" {
  type      = string
  sensitive = true
}

variable "class_db_url" {
  type      = string
  sensitive = true
}

variable "teacher_db_url" {
  type      = string
  sensitive = true
}

variable "tuition_db_url" {
  type      = string
  sensitive = true
}