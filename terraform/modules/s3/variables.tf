variable "project_name" {
  type    = string
  default = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "name" {
  type    = string
  default = "teacher-service"
}


# variable "allowed_origins" {
#   type = list(string)
#   default = ["*"] # nên sửa thành domain frontend
# }

variable "allowed_principals" {
  description = "IAM ARNs list for bucket upload permission (Lambda, API Gateway)"
  type        = list(string)
  default     = []
}
