locals {
  generic_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
    "arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess",
  ]

  # Phân tách policy từ generic_policy_arns để tạo map 1-1 service-policy
  # Vd: auth_AWSLambdaBasicExecutionRole = { service = "auth", policy_arn = "..." }
  shared_policy_map = merge([
    for service, _ in var.lambda_services : {
      for policy_arn in local.generic_policy_arns :
      "${service}_${basename(policy_arn)}" => {
        service    = service
        policy_arn = policy_arn
      }
    }
  ]...)
}

locals {
  secrets_map = {
    auth = [
      var.auth_secret_arn,
      var.public_key_secret_arn
    ]

    class = [
      var.supabase_secret_arns["class"],
      var.public_key_secret_arn
    ]

    student = [
      var.supabase_secret_arns["student"],
      var.public_key_secret_arn
    ]

    tuition = [
      var.supabase_secret_arns["tuition"],
      var.public_key_secret_arn
    ]

    teacher = [
      var.supabase_secret_arns["teacher"],
      var.public_key_secret_arn
    ]
  }
}

locals {
  # Check secret_keys phải khớp với lambda_keys
  # Lấy danh sách key
  lambda_keys = keys(var.lambda_services)
  secret_keys = keys(local.secrets_map)

  # Danh sách key không khớp (nếu có)
  mismatched_keys = [
    for k in concat(local.lambda_keys, local.secret_keys) :
    k if !(
      contains(local.lambda_keys, k) &&
      contains(local.secret_keys, k)
    )
  ]

  # Validate keys phải khớp
  validate_keys = length(local.mismatched_keys) == 0 ? true : file("ERROR: Keys in lambda_services and secrets_map must match. Mismatches: ${local.mismatched_keys}")
}

# TẠO IAM ROLE CHO 5 FUNCTIONS
resource "aws_iam_role" "lambda_role" {
  for_each = var.lambda_services

  name = "${var.project_name}-${each.key}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.project_name}-${each.key}-lambda-role"
  })
}

# GÁN POLICY
# Gán policy chung cho 5 lambda function
resource "aws_iam_role_policy_attachment" "shared" {
  for_each = local.shared_policy_map

  role       = aws_iam_role.lambda_role[each.value.service].name
  policy_arn = each.value.policy_arn
}

# NOTE: Gán each.key chéo (secret_map -> lambda_role, secrets) có thể gây lỗi nếu các element trong các biến có giá trị không đồng nhất
# NOTE: Buộc các biến lambda_services, secrets_map phải có các element tên auth, class, student, tuition, teacher
# Gán secret policy
resource "aws_iam_role_policy_attachment" "secrets_policy" {
  for_each = local.secrets_map

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.secret_policy[each.key].arn
}

# Gán policy cho teacher service dùng S3
resource "aws_iam_role_policy_attachment" "teacher_lambda" {
  role       = aws_iam_role.lambda_role["teacher"].name
  policy_arn = aws_iam_policy.s3_policy.arn
}

# CUSTOM POLICY
resource "aws_iam_policy" "s3_policy" {
  name = "${var.project_name}-s3-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow",
      Action = [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      Resource = "${var.s3_arn}/*"
    }]
  })
}

resource "aws_iam_policy" "secret_policy" {
  for_each = local.secrets_map

  name = "${var.project_name}-${each.key}-secrets-policy"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:GetSecretValue"
      ]
      Resource = each.value
    }]
  })
}