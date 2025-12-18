output "cache_name" {
  description = "Serverless cache name"
  value       = aws_elasticache_serverless_cache.main.name
}

output "cache_arn" {
  description = "Serverless cache ARN"
  value       = aws_elasticache_serverless_cache.main.arn
}

output "cache_id" {
  description = "Serverless cache ID"
  value       = aws_elasticache_serverless_cache.main.id
}

# Endpoint block nên được bỏ vào try() để tránh lỗi khi resource chưa được tạo
output "endpoint_address" {
  description = "Primary endpoint DNS address"
  value       = try(aws_elasticache_serverless_cache.main.endpoint[0].address, null)
}

output "endpoint_port" {
  description = "Primary endpoint port"
  value       = try(aws_elasticache_serverless_cache.main.endpoint[0].port, null)
}

output "reader_endpoint_address" {
  description = "Reader endpoint DNS (if available) for read-only operations"
  value       = try(aws_elasticache_serverless_cache.main.reader_endpoint[0].address, null)
}

output "reader_endpoint_port" {
  description = "Reader endpoint port"
  value       = try(aws_elasticache_serverless_cache.main.reader_endpoint[0].port, null)
}
