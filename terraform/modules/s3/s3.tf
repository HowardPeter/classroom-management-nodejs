resource "aws_s3_bucket" "main" {
  bucket = "${var.project_name}-${var.name}-bucket"

  tags = merge(
    var.tags,
    { Name = "${var.project_name}-${var.name}-bucket" }
  )
}

# Bật versioning
resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.main.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Thiết lập lifecycle cho versioning
resource "aws_s3_bucket_lifecycle_configuration" "version_rule" {
  bucket = aws_s3_bucket.main.id

  rule {
    id     = "cleanup-old-versions"
    status = "Enabled"

    filter {}

    # Chuyển version cũ sang storage class rẻ hơn (Glacier) sau 7 ngày
    noncurrent_version_transition {
      noncurrent_days = 7
      storage_class   = "GLACIER"
    }

    # Xóa các object version cũ sau 30 ngày
    noncurrent_version_expiration {
      noncurrent_days = 30
    }

    # Dọn rác từ multipart upload bị treo (khi client upload thất bại)
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  # Chuyển phiên bản hiện tại sau X ngày
  rule {
    id     = "transition-to-ia"
    status = "Enabled"

    filter {}

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 180
    }
  }
}

# Mã hoá server-side S3-managed SSE
resource "aws_s3_bucket_server_side_encryption_configuration" "sse" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "public" {
  bucket                  = aws_s3_bucket.main.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# # Bật CORS nếu có frontend upload ảnh
# resource "aws_s3_bucket_cors_configuration" "cors" {
#   bucket = aws_s3_bucket.main.id

#   cors_rule {
#     allowed_methods = ["PUT", "POST", "GET"]
#     allowed_origins = var.allowed_origins
#     allowed_headers = ["*"]
#     max_age_seconds = 3000
#   }
# }

# Bucket policy cho phép Lambda hoặc API Gateway truy cập
# INFO: Bucket policy đảm bảo chỉ những IAM role cụ thể mới được phép truy cập
resource "aws_s3_bucket_policy" "policy" {
  bucket = aws_s3_bucket.main.id
  policy = data.aws_iam_policy_document.bucket_policy.json
}

data "aws_iam_policy_document" "bucket_policy" {
  statement {
    sid    = ""
    effect = "Allow"

    dynamic "principals" {
      for_each = length(var.allowed_principals) > 0 ? [1] : []
      content {
        type        = "AWS"
        identifiers = var.allowed_principals # IAM Role ARN
      }
    }

    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
    ]

    resources = [
      "${aws_s3_bucket.main.arn}/*"
    ]
  }
}