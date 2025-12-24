resource "aws_cloudwatch_dashboard" "elasticache" {
  dashboard_name = "${var.project_name}-elasticache-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type  = "metric",
        x     = 0, y = 0,
        width = 12, height = 6,
        properties = {
          title  = "ElastiCache CPU Utilization",
          view   = "timeSeries",
          region = var.region,
          stat   = "Average",
          metrics = [
            ["AWS/ElastiCache", "CPUUtilization", "CacheName", var.cache_serverless_name
            ]
          ]
        }
      },
      {
        type  = "metric",
        x     = 12, y = 0,
        width = 12, height = 6,
        properties = {
          title  = "ElastiCache Freeable Memory",
          view   = "timeSeries",
          region = var.region,
          stat   = "Average",
          metrics = [
            ["AWS/ElastiCache", "FreeableMemory", "CacheName", var.cache_serverless_name, {}]
          ]
        }
      },
      {
        type  = "metric",
        x     = 0, y = 6,
        width = 12, height = 6,
        properties = {
          title  = "ElastiCache Current Connections",
          view   = "timeSeries",
          region = var.region,
          stat   = "Average",
          metrics = [
            ["AWS/ElastiCache", "CurrConnections", "CacheName", var.cache_serverless_name, {}]
          ]
        }
      },
      {
        type  = "metric",
        x     = 12, y = 6,
        width = 12, height = 6,
        properties = {
          title  = "ElastiCache Evictions",
          view   = "timeSeries",
          region = var.region,
          stat   = "Sum",
          metrics = [
            ["AWS/ElastiCache", "Evictions", "CacheName", var.cache_serverless_name, {}]
          ]
        }
      },
    ]
  })
}

# Theo dõi CPU Utilization
# CPU Utilization WARN (> 75%)
resource "aws_cloudwatch_metric_alarm" "elasticache_high_cpu_warn" {
  alarm_name          = "${var.project_name}-elasticache-high-cpu-warn-alarm"
  namespace           = "AWS/ElastiCache"
  metric_name         = "CPUUtilization"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 75
  period              = 300
  evaluation_periods  = 3
  statistic           = "Average"

  alarm_actions = [aws_sns_topic.notifications.arn]
  ok_actions    = [aws_sns_topic.notifications.arn]

  dimensions = {
    CacheName = var.cache_serverless_name
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-elasticache-high-cpu-warn-alarm"
  })
}

# CPU Utilization CRITIAL (> 90%)
resource "aws_cloudwatch_metric_alarm" "elasticache_high_cpu_critical" {
  alarm_name          = "${var.project_name}-elasticache-high-cpu-critial-alarm"
  namespace           = "AWS/ElastiCache"
  metric_name         = "CPUUtilization"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 90
  period              = 300
  evaluation_periods  = 3
  statistic           = "Average"

  alarm_actions = [aws_sns_topic.notifications.arn]
  ok_actions    = [aws_sns_topic.notifications.arn]

  dimensions = {
    CacheName = var.cache_serverless_name
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-elasticache-high-cpu-critical-alarm"
  })
}

# Theo dõi FreeableMemory (Bộ nhớ còn trống)
# FreeableMemory WARN (< 200MB)
resource "aws_cloudwatch_metric_alarm" "elasticache_low_memory_warn" {
  alarm_name          = "${var.project_name}-elasticache-low-memory-warn"
  namespace           = "AWS/ElastiCache"
  metric_name         = "FreeableMemory"
  comparison_operator = "LessThanThreshold"
  threshold           = 200000000 # 200 MB in bytes
  period              = 300
  evaluation_periods  = 2
  statistic           = "Average"

  alarm_actions = [aws_sns_topic.notifications.arn]
  ok_actions    = [aws_sns_topic.notifications.arn]

  dimensions = {
    CacheName = var.cache_serverless_name
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-elasticache-low-memory-warn"
  })
}

# FreeableMemory CRITICAL (< 100MB)
resource "aws_cloudwatch_metric_alarm" "elasticache_low_memory_critical" {
  alarm_name          = "${var.project_name}-elasticache-low-memory-critical"
  namespace           = "AWS/ElastiCache"
  metric_name         = "FreeableMemory"
  comparison_operator = "LessThanThreshold"
  threshold           = 100000000 # 100 MB
  period              = 300
  evaluation_periods  = 1
  statistic           = "Average"

  alarm_actions = [aws_sns_topic.notifications.arn]
  ok_actions    = [aws_sns_topic.notifications.arn]

  dimensions = {
    CacheName = var.cache_serverless_name
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-elasticache-low-memory-critical"
  })
}

# Theo dõi Evictions (Redis đầy bộ nhớ và đang xoá key để sống sót)
resource "aws_cloudwatch_metric_alarm" "elasticache_evictions" {
  alarm_name          = "${var.project_name}-elasticache-evictions-alarm"
  namespace           = "AWS/ElastiCache"
  metric_name         = "Evictions"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 0
  period              = 300
  evaluation_periods  = 1
  statistic           = "Sum"

  alarm_actions = [aws_sns_topic.notifications.arn]
  ok_actions    = [aws_sns_topic.notifications.arn]

  dimensions = {
    CacheName = var.cache_serverless_name
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-elasticache-evictions"
  })
}

# Theo dõi các kết nối hiện tại
resource "aws_cloudwatch_metric_alarm" "elasticache_high_connections" {
  alarm_name          = "${var.project_name}-elasticache-high-connections"
  namespace           = "AWS/ElastiCache"
  metric_name         = "CurrConnections"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 500
  period              = 300
  evaluation_periods  = 2
  statistic           = "Average"

  alarm_actions = [aws_sns_topic.notifications.arn]
  ok_actions    = [aws_sns_topic.notifications.arn]

  dimensions = {
    CacheName = var.cache_serverless_name
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-elasticache-high-connections"
  })
}