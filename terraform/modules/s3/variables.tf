variable "project_name" {
  type = string
}

variable "name" {
  type = string
  default = "teacher-service"
}

variable "tags" {
  type    = map(string)
  default = {}
}

# variable "allowed_origins" {
#   type = list(string)
#   default = ["*"] # nên sửa thành domain frontend
# }

variable "allowed_principals" {
  type        = list(string)
  default     = []
}
