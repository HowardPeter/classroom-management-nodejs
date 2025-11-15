variable "project_name" {
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "public_subnets" {
  description = "CIDR for public subnets"
  type        = list(string)
}

variable "private_subnets" {
  description = "CIDR for private subnets"
  type        = list(string)
}

variable "tags" {
  type        = map(string)
  default = {}
}
