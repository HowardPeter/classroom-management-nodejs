variable "aws_region" {
  type = string
  default = "ap-southeast-1"
}

# Variables chung
variable "project_name" {
  description = "Project prefix name"
  type        = string
  default     = "book-mg"
}

variable "tags" {
  description = "Tags for AWS resources"
  type        = map(string)
  default = {
    Environment = "prod"
    Project     = "book-mg"
  }
}

# Network variables
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnets" {
  description = "Public subnet list"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  description = "Private subnet list"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}

# S3 variables
variable "name" {
  type = string
  default = "teacher-service"
}

# variable "allowed_origins" {
#   type = list(string)
#   default = ["*"] # nên sửa thành domain frontend
# }

variable "allowed_principals" {
  type        = list(string)
  description = "IAM ARNs list for bucket upload permission (Lambda, API Gateway)"
  default     = []
}