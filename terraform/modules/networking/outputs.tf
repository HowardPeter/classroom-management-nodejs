output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "List of public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnets"
  value       = aws_subnet.private[*].id
}

output "lambda_sg_id" {
  description = "Security Group ID for Lambda"
  value       = aws_security_group.lambda_sg.id
}

output "elasticache_sg_id" {
  description = "Security Group ID for elasticache"
  value       = aws_security_group.elasticache_sg.id
}