output "vpc_id" {
  value       = aws_vpc.main.id
  description = "VPC ID"
}

output "public_subnets" {
  value       = aws_subnet.public[*].id
  description = "List of public subnets"
}

output "private_subnets" {
  value       = aws_subnet.private[*].id
  description = "List of private subnets"
}

output "lambda_sg_id" {
  value       = aws_security_group.lambda_sg.id
  description = "Security Group ID for Lambda"
}

output "elasticache_sg_id" {
  value       = aws_security_group.elasticache_sg.id
  description = "Security Group ID for elasticache"
}