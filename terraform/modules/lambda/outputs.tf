output "lambda_functions" {
  description = "Map of all Lambda function ARNs and names"
  value = var.ecr_enabled ? {
    for svc, lambda in aws_lambda_function.functions :
    svc => {
      arn        = lambda.arn
      invoke_arn = lambda.invoke_arn
      name       = lambda.function_name
    }
  } : {}
}