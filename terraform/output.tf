# VPC
output "vpc_id" {
  description = "ID of main VPC"
  value       = module.networking.vpc_id
}

# S3
output "s3_bucket_name" {
  description = "Name of S3 bucket"
  value       = module.s3_bucket.bucket_name
}

# Secret Manager
output "secrets_arns" {
  description = "ARNs of secrets in Secrets Manager"
  value = {
    auth_secret_arn       = module.secrets.auth_secret_arn
    public_key_secret_arn = module.secrets.public_key_secret_arn
    supabase_secret_arns  = module.secrets.supabase_secret_arns
  }
}

# ECR
output "ecr_repository_urls" {
  description = "URLs of ECR repositories"
  value       = module.ecr.repository_urls
}

# ElastiCache
output "elasticache" {
  value = {
    endpoint_address = module.elasticache.endpoint_address
    endpoint_port    = module.elasticache.endpoint_port
  }
}

# Lambda Services
output "lambda_services" {
  description = "Lambda service names and ARNs"
  value       = module.lambda.lambda_functions
}

# # API Gateway
# output "api_gateway" {
#   value = {
#     api_endpoint = module.api_gateway.api_endpoint
#     api_name     = module.api_gateway.api_name
#     stage        = module.api_gateway.stage_name
#   }
# }