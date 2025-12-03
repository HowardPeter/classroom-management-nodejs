output "apigateway_log_group" {
  description = "ARN of API Gateway log group"
  value       = aws_cloudwatch_log_group.api_gateway.arn
}