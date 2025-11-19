variable "project_name" {
  type        = string
}

variable "tags" {
  type        = map(string)
  default     = {}
}

variable "services" {
  type        = list(string)
  description = "Service list for ECR repository"
}