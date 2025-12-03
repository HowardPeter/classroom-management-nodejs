variable "project_name" {
  type    = string
  default = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "services" {
  type        = list(string)
  description = "Service list for ECR repository"
  default     = []
}