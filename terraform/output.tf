# VPC
output "vpc_id" {
  description = "ID của VPC chính"
  value       = module.networking.vpc_id
}

output "private_subnets" {
  description = "Danh sách subnet riêng tư"
  value       = module.networking.private_subnets
}

output "public_subnets" {
  description = "Danh sách subnet công khai"
  value       = module.networking.public_subnets
}