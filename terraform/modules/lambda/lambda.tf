resource "aws_lambda_function" "functions" {
  for_each = var.ecr_enabled ? var.lambda_services : {}

  function_name = "${var.project_name}-lambda-${each.key}-function"

  role         = aws_iam_role.lambda_role[each.key].arn
  package_type = "Image"
  image_uri    = "${each.value.image}:latest"

  memory_size = each.value.memory
  timeout     = each.value.timeout

  architectures = each.value.architectures

  # Bật X-ray tracing
  tracing_config {
    mode = "Active"
  }

  # Cấu hình VPC cho truy cập elasticache trong VPC
  vpc_config {
    subnet_ids         = var.vpc_subnet_ids
    security_group_ids = var.vpc_security_group_ids
  }

  # Biến môi trường
  environment {
    variables = each.value.environment
  }

  tags = merge(var.tags, {
    FunctionName = "${var.project_name}-lambda-${each.key}-function"
  })
}

# Tạo quyền gọi API giữa các function
resource "aws_lambda_permission" "allow_invoke" {
  for_each = var.ecr_enabled ? {
    for fnc, targets in var.invoke_permissions :
    fnc => targets
  } : {}

  statement_id  = "AllowLambdaInvoke-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.functions[each.value[0]].function_name
  principal     = "lambda.amazonaws.com"

  source_arn = aws_lambda_function.functions[each.key].arn
}