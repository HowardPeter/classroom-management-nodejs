resource "aws_cloudwatch_dashboard" "lambda" {
  dashboard_name = "${var.project_name}-lambda-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type  = "metric",
        x     = 0, y = 0,
        width = 24, height = 6,
        properties = {
          title   = "Lambda Errors (All Services)",
          view    = "timeSeries",
          stacked = false, # Biểu thị đường xếp chồng (true) hoặc đường riêng biệt (false)
          region  = var.region,
          stat    = "Sum",
          metrics = [
            ["AWS/Lambda", "Errors", "FunctionName", var.function_name.auth, { "label" : "auth" }],
            ["AWS/Lambda", "Errors", "FunctionName", var.function_name.class, { "label" : "class" }],
            ["AWS/Lambda", "Errors", "FunctionName", var.function_name.student, { "label" : "student" }],
            ["AWS/Lambda", "Errors", "FunctionName", var.function_name.tuition, { "label" : "tuition" }],
            ["AWS/Lambda", "Errors", "FunctionName", var.function_name.teacher, { "label" : "teacher" }]
          ]
        }
      },
      {
        type  = "metric",
        x     = 0, y = 6,
        width = 24, height = 6,
        properties = {
          title  = "Lambda Duration p95 (All Services)",
          view   = "timeSeries",
          region = var.region,
          stat   = "p95",
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", var.function_name.auth, { "label" : "auth" }],
            ["AWS/Lambda", "Duration", "FunctionName", var.function_name.class, { "label" : "class" }],
            ["AWS/Lambda", "Duration", "FunctionName", var.function_name.student, { "label" : "student" }],
            ["AWS/Lambda", "Duration", "FunctionName", var.function_name.tuition, { "label" : "tuition" }],
            ["AWS/Lambda", "Duration", "FunctionName", var.function_name.teacher, { "label" : "teacher" }]
          ]
        }
      },
      {
        type  = "metric",
        x     = 0, y = 12,
        width = 24, height = 6,
        properties = {
          title  = "Lambda Throttles (All Services)",
          view   = "timeSeries",
          region = var.region,
          stat   = "Sum",
          metrics = [
            ["AWS/Lambda", "Throttles", "FunctionName", var.function_name.auth, { "label" : "auth" }],
            ["AWS/Lambda", "Throttles", "FunctionName", var.function_name.class, { "label" : "class" }],
            ["AWS/Lambda", "Throttles", "FunctionName", var.function_name.student, { "label" : "student" }],
            ["AWS/Lambda", "Throttles", "FunctionName", var.function_name.tuition, { "label" : "tuition" }],
            ["AWS/Lambda", "Throttles", "FunctionName", var.function_name.teacher, { "label" : "teacher" }]
          ]
        }
      },
      {
        type  = "metric",
        x     = 0, y = 18,
        width = 24, height = 6,
        properties = {
          title  = "Concurrent Executions (All Services)",
          view   = "timeSeries",
          region = var.region,
          stat   = "Maximum",
          metrics = [
            ["AWS/Lambda", "ConcurrentExecutions", "FunctionName", var.function_name.auth, {}],
            ["AWS/Lambda", "ConcurrentExecutions", "FunctionName", var.function_name.class, {}],
            ["AWS/Lambda", "ConcurrentExecutions", "FunctionName", var.function_name.student, {}],
            ["AWS/Lambda", "ConcurrentExecutions", "FunctionName", var.function_name.tuition, {}],
            ["AWS/Lambda", "ConcurrentExecutions", "FunctionName", var.function_name.teacher, {}]
          ]
        }
      },
      {
        type  = "metric",
        x     = 0, y = 24,
        width = 24, height = 6,
        properties = {
          title  = "Lambda Invocations (All Services)",
          view   = "timeSeries",
          region = var.region,
          stat   = "Sum",
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", var.function_name.auth, {}],
            ["AWS/Lambda", "Invocations", "FunctionName", var.function_name.class, {}],
            ["AWS/Lambda", "Invocations", "FunctionName", var.function_name.student, {}],
            ["AWS/Lambda", "Invocations", "FunctionName", var.function_name.tuition, {}],
            ["AWS/Lambda", "Invocations", "FunctionName", var.function_name.teacher, {}]
          ]
        }
      }
    ]
  })
}

# Theo dõi Log
resource "aws_cloudwatch_log_group" "lambda" {
  for_each = var.function_name

  name              = "/aws/lambda/${each.value}" # Chỉ định nơi lưu trữ log
  retention_in_days = 30                          # Lưu trữ log trong X ngày

  tags = merge(var.tags, {
    Name     = "${var.project_name}-lambda-${each.key}-log"
    Function = each.key
  })
}

# Theo dõi Error - Có tổng số lỗi >= 1 trong 60s
resource "aws_cloudwatch_metric_alarm" "lambda_error" {
  for_each = var.function_name

  alarm_name          = "${var.project_name}-lambda-${each.key}-error"
  namespace           = "AWS/Lambda"
  metric_name         = "Errors"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 0 # Ngưỡng kích hoạt alarm
  # INFO: CloudWatch theo dõi metric theo datapoint (ô thời gian), độ dài mỗi datapoint quy định bằng period
  # INFO: Sau X datapoint (quy định bằng evaluation_periods), CloudWatch gom các metric với nhau và so sánh
  # INFO: datapoints_to_alarm: Số datapoint trong X datapoint (evaluation_periods) phải vượt threshold để kích hoạt alarm
  # INFO: Ví dụ: evaluation_periods  = 5 & datapoints_to_alarm = 3 -> Cần 3/5 datapoint bị lỗi để kích hoạt alarm
  period             = 60 # Độ dài mỗi datapoint (sec)
  evaluation_periods = 3  # Số datapoint cloudwatch so sánh để xem xét vượt ngưỡng
  statistic          = "Sum"

  # Hành động thực hiện khi alarm kích hoạt
  alarm_actions = [aws_sns_topic.notifications.arn]
  ok_actions    = [aws_sns_topic.notifications.arn]

  # Filter theo giá trị
  dimensions = {
    FunctionName = each.value
  }

  tags = merge(var.tags, {
    Name     = "${var.project_name}-lambda-${each.key}-error"
    Function = each.key
  })
}

# Theo dõi Duration - Duration p95 >= 80% timeout
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  for_each = var.function_name

  alarm_name          = "${var.project_name}-lambda-${each.key}-duration"
  namespace           = "AWS/Lambda"
  metric_name         = "Duration"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = 8000
  period              = 60
  evaluation_periods  = 15
  datapoints_to_alarm = 15
  extended_statistic  = "p95" # percentile

  alarm_actions = [aws_sns_topic.notifications.arn]
  ok_actions    = [aws_sns_topic.notifications.arn]

  dimensions = {
    FunctionName = each.value
  }

  tags = merge(var.tags, {
    Name     = "${var.project_name}-lambda-${each.key}-duration"
    Function = each.key
  })
}

# Theo dõi Throttles (Lambda bị giới hạn tài nguyên, request) - Throttles > 0
resource "aws_cloudwatch_metric_alarm" "lambda_throttle" {
  for_each = var.function_name

  alarm_name          = "${var.project_name}-lambda-${each.key}-throttle"
  namespace           = "AWS/Lambda"
  metric_name         = "Throttles"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 0
  period              = 60
  evaluation_periods  = 5
  statistic           = "Sum"

  alarm_actions = [aws_sns_topic.notifications.arn]
  ok_actions    = [aws_sns_topic.notifications.arn]

  dimensions = {
    FunctionName = each.value
  }

  tags = merge(var.tags, {
    Name     = "${var.project_name}-lambda-${each.key}-throttle"
    Function = each.key
  })
}

# Theo dõi Concurrent Evocation (Số instance lambda chạy đồng thời)
resource "aws_cloudwatch_metric_alarm" "lambda_high_concurrency" {
  for_each = var.function_name

  alarm_name          = "${var.project_name}-lambda-${each.key}-high-concurrency"
  namespace           = "AWS/Lambda"
  metric_name         = "ConcurrentExecutions"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = 50
  period              = 60
  evaluation_periods  = 1
  statistic           = "Maximum"

  alarm_actions = [aws_sns_topic.notifications.arn]
  ok_actions    = [aws_sns_topic.notifications.arn]

  dimensions = {
    FunctionName = each.value
  }

  tags = merge(var.tags, {
    Name     = "${var.project_name}-lambda-${each.key}-high-concurrency"
    Function = each.key
  })
}

# Theo dõi Invocations (Tổng số lần gọi hàm lambda)
resource "aws_cloudwatch_metric_alarm" "lambda_invocation_spike" {
  for_each = var.function_name

  alarm_name          = "${var.project_name}-lambda-${each.key}-invocation-spike"
  namespace           = "AWS/Lambda"
  metric_name         = "Invocations"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 200
  period              = 60
  evaluation_periods  = 1
  statistic           = "Sum"

  alarm_actions = [aws_sns_topic.notifications.arn]
  ok_actions    = [aws_sns_topic.notifications.arn]

  dimensions = {
    FunctionName = each.value
  }

  tags = merge(var.tags, {
    Name     = "${var.project_name}-lambda-${each.key}-invocation-spike"
    Function = each.key
  })
}