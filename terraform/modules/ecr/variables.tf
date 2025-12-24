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

variable "expired_days" {
  description = "Number of days untagged image stored"
  type        = number
  default     = 7
}