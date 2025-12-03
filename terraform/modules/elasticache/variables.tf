variable "project_name" {
  type    = string
  default = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "security_group_ids" {
  description = "Security groups ID for ElastiCache"
  type        = list(string)
  default     = []
}

variable "subnet_ids" {
  description = "List of private subnet IDs for ElastiCache Subnet Group"
  type        = list(string)
  default     = []
}

variable "engine" {
  description = "ElastiCache serverless engine: valkey | redis | memcached"
  type        = string
  default     = "valkey"
}

variable "major_engine_version" {
  description = "Major engine version"
  type        = string
  default     = "7"
}

# Đảm bảo Lambda role có quyền kms:Decrypt nếu dùng KMS key
variable "kms_key_id" {
  description = "Optional KMS key ARN for at-rest encryption"
  type        = string
  default     = null
}

variable "cache_storage_max_gb" {
  description = "Maximum data storage (GB) used by serverless cache"
  type        = number
  default     = 10
}

variable "ecpu_per_second_max" {
  description = "Maximum eCPU-per-second limit (throughput model) for serverless"
  type        = number
  default     = 5000
}

variable "snapshot_retention_limit" {
  description = "Number of daily snapshots to keep (0 to disable)"
  type        = number
  default     = 1
}

variable "daily_snapshot_time" {
  description = "Preferred daily snapshot time (HH:MM in UTC)"
  type        = string
  default     = null
}