resource "aws_lambda_function" "functions" {
  for_each = var.lambda_services

  function_name = "${var.project_name}-lambda-${each.key}-function"

  role         = aws_iam_role.lambda_role[each.key].arn
  package_type = "Image"
  image_uri    = "${each.value.image}:latest"

  memory_size = each.value.memory
  timeout     = each.value.timeout

  architectures = each.value.architectures

  environment {
    variables = each.value.environment
  }

  tags = merge(var.tags, {
    FunctionName = "${var.project_name}-lambda-${each.key}-function"
  })
}