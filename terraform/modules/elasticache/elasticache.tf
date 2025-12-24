resource "aws_elasticache_serverless_cache" "main" {
  name   = "${var.project_name}-elasticache"
  engine = var.engine

  # Kiểm soát chi phí và hiệu suất bằng cách đặt giới hạn sử dụng bộ nhớ đệm
  cache_usage_limits {
    # Giới hạn dung lượng bộ nhớ RAM
    data_storage {
      maximum = var.cache_storage_max_gb
      unit    = "GB"
    }
    # Giới hạn throughput/performance dựa trên eCPU-per-second
    ecpu_per_second {
      maximum = var.ecpu_per_second_max
    }
  }

  major_engine_version     = var.major_engine_version
  kms_key_id               = var.kms_key_id               # KMS Key để mã hóa data at rest
  daily_snapshot_time      = var.daily_snapshot_time      # Thời gian AWS tạo snapshot mỗi ngày (UTC)
  snapshot_retention_limit = var.snapshot_retention_limit # Số ngày giữ snapshot

  security_group_ids = var.security_group_ids
  subnet_ids         = var.subnet_ids

  tags = merge(var.tags, {
    Name = "${var.project_name}-elasticache"
  })
}