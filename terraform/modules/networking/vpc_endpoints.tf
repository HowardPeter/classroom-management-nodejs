# INFO: VPC Endpoints cho ECR để không đi qua NAT Gateway (giảm chi phí) và tăng bảo mật mạng
# ECR API endpoint
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.ecr.api"
  vpc_endpoint_type = "Interface"

  # Override Public DNS thành Private DNS để truy cập endpoint qua mạng private (bắt buộc)
  private_dns_enabled = true

  subnet_ids         = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.vpce_sg.id]

  tags = merge(var.tags, {
    Name = "${var.project_name}-ecr-api-endpoint"
  })
}

# ECR DKR (Docker Registry) endpoint
resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.ecr.dkr"
  vpc_endpoint_type = "Interface"

  # Override Public DNS thành Private DNS để truy cập endpoint qua mạng private (bắt buộc)
  private_dns_enabled = true

  subnet_ids         = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.vpce_sg.id]

  tags = merge(var.tags, {
    Name = "${var.project_name}-ecr-dkr-endpoint"
  })
}

# Secret Manager endpoint
resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.secretsmanager"
  vpc_endpoint_type = "Interface"

  # Override Public DNS thành Private DNS để truy cập endpoint qua mạng private (bắt buộc)
  private_dns_enabled = true

  subnet_ids         = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.vpce_sg.id]

  tags = merge(var.tags, {
    Name = "${var.project_name}-secretsmanager-endpoint"
  })
}

# S3 endpoint (gateway)
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"

  route_table_ids = aws_route_table.private[*].id

  tags = merge(var.tags, {
    Name = "${var.project_name}-s3-gateway-endpoint"
  })
}