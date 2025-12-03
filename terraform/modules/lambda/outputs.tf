output "lambda_functions" {
  description = "Map of all Lambda function ARNs and names"
  value = {
    auth = {
      arn        = aws_lambda_function.auth.arn
      invoke_arn = aws_lambda_function.auth.invoke_arn
      name       = aws_lambda_function.auth.function_name
    }
    class = {
      arn        = aws_lambda_function.class.arn
      invoke_arn = aws_lambda_function.class.invoke_arn
      name       = aws_lambda_function.class.function_name
    }
    student = {
      arn        = aws_lambda_function.student.arn
      invoke_arn = aws_lambda_function.student.invoke_arn
      name       = aws_lambda_function.student.function_name
    }
    teacher = {
      arn        = aws_lambda_function.teacher.arn
      invoke_arn = aws_lambda_function.teacher.invoke_arn
      name       = aws_lambda_function.teacher.function_name
    }
    tuition = {
      arn        = aws_lambda_function.tuition.arn
      invoke_arn = aws_lambda_function.tuition.invoke_arn
      name       = aws_lambda_function.tuition.function_name
    }
  }
}