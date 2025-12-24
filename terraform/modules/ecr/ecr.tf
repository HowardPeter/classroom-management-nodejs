resource "aws_ecr_repository" "repos" {
  for_each = toset(var.services) # Tạo repository cho mỗi service trong list

  name                 = "${var.project_name}-${each.key}"
  image_tag_mutability = "MUTABLE" # Cho phép tag ảnh có thể thay đổi

  image_scanning_configuration {
    scan_on_push = true # Tự động quét lỗ hổng khi đẩy ảnh lên
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${each.key}"
  })
}

resource "aws_ecr_lifecycle_policy" "cleanup" {
  for_each = toset(var.services)

  repository = aws_ecr_repository.repos[each.key].name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Delete untagged images older than X days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = var.expired_days
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep only maximum 10 images left"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
