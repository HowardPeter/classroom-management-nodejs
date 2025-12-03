# Secrets cho các service dùng supabase
resource "aws_secretsmanager_secret" "supabase" {
  for_each = var.supabase_services # Tạo secret cho mỗi service trong map

  name        = "${var.project_name}/${each.key}"
  description = "Supabase credentials for ${each.key}"

  tags = merge(var.tags, {
    Service = each.key
  })
}

resource "aws_secretsmanager_secret_version" "supabase_version" {
  for_each = var.supabase_services

  secret_id = aws_secretsmanager_secret.supabase[each.key].id
  secret_string = jsonencode({
    DATABASE_URL = each.value.database_url
    DIRECT_URL   = each.value.direct_url
  })
}

# Auth service secret (Mongo Atlas + Keys)
resource "aws_secretsmanager_secret" "auth" {
  name        = "${var.project_name}/auth-service"
  description = "Auth Service MongoDB + Key secrets"

  tags = merge(var.tags, {
    Service = "auth"
  })
}

resource "aws_secretsmanager_secret_version" "auth_version" {
  secret_id = aws_secretsmanager_secret.auth.id

  secret_string = jsonencode({
    MONGO_USERNAME       = var.auth_service.mongo_username
    MONGO_PASSWORD       = var.auth_service.mongo_password
    MONGO_HOST           = var.auth_service.mongo_host
    PRIVATE_KEY          = var.auth_service.private_key
    REFRESH_TOKEN_SECRET = var.auth_service.refresh_token_secret
  })
}

# Public key secret
resource "aws_secretsmanager_secret" "public_key" {
  name        = "${var.project_name}/public-key"
  description = "JWT public key"

  tags = merge(var.tags, {
    Service = "public-key"
  })
}

resource "aws_secretsmanager_secret_version" "public_key_version" {
  secret_id = aws_secretsmanager_secret.public_key.id

  secret_string = jsonencode({
    PUBLIC_KEY = var.public_key
  })
}
