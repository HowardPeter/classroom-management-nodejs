output "repository_urls" {
  description = "Map: service_name -> ECR repo URL"
  value = {
    for svc, repo in aws_ecr_repository.repos :
    svc => repo.repository_url
  }
}

output "repository_arns" {
  description = "Map: service_name -> ECR repo ARN"
  value = {
    for svc, repo in aws_ecr_repository.repos :
    svc => repo.arn
  }
}