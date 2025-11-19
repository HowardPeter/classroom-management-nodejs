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