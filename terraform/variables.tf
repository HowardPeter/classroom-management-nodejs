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

# Student service secret value
variable "student_db_url" {
  type      = string
  sensitive = true
}

variable "student_direct_url" {
  type      = string
  sensitive = true
}

# Class service secret value
variable "class_db_url" {
  type      = string
  sensitive = true
}

variable "class_direct_url" {
  type      = string
  sensitive = true
}

# Teacher service secret value
variable "teacher_db_url" {
  type      = string
  sensitive = true
}

variable "teacher_direct_url" {
  type      = string
  sensitive = true
}

# Tuition service secret value
variable "tuition_db_url" {
  type      = string
  sensitive = true
}

variable "tuition_direct_url" {
  type      = string
  sensitive = true
}