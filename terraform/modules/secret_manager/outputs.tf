output "supabase_secret_arns" {
  description = "ARN of services using Supabase secrets"
  value = {
    for k, v in aws_secretsmanager_secret.supabase :
    k => v.arn
  }
}

output "auth_secret_arn" {
  description = "ARN of auth service secret"
  value       = aws_secretsmanager_secret.auth.arn
}

output "public_key_secret_arn" {
  description = "ARN of public key secret"
  value       = aws_secretsmanager_secret.public_key.arn
}