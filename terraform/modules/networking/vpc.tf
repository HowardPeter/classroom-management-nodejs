# VPC CHÍNH
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true # Bật hỗ trợ DNS bên trong VPC
  enable_dns_hostnames = true # Cho phép tạo hostname cho instance trong VPC

  # Gắn tag: tag chung (var.tags) + tag riêng
  tags = merge(var.tags, {
    Name = "${var.project_name}-vpc"
  })
}

# INTERNET GATEWAY — Cho phép subnet public truy cập Internet
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags = merge(var.tags, {
    Name = "${var.project_name}-igw"
  })
}

# PUBLIC SUBNETS
resource "aws_subnet" "public" {
  count                   = length(var.public_subnets) # Tạo nhiều subnet tùy theo số CIDR trong danh sách
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnets[count.index]                          # Tham chiếu đến CIDR tương ứng trong mảng cho từng subnet
  map_public_ip_on_launch = true                                                     # Tự động gán IP public khi tạo EC2 (cho Public Subnet ra IGW)
  availability_zone       = data.aws_availability_zones.available.names[count.index] # Mỗi subnet ở 1 AZ khác nhau

  tags = merge(var.tags, {
    Name = "${var.project_name}-public-sn-${count.index + 1}"
  })
}

# PRIVATE SUBNETS
resource "aws_subnet" "private" {
  count             = length(var.private_subnets)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = merge(var.tags, {
    Name = "${var.project_name}-private-sn-${count.index + 1}"
  })
}

# NAT GATEWAY — Cho phép subnet private ra Internet (qua subnet public)
# Tạo Elastic IP (EIP) cho NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"
  tags = merge(var.tags, {
    Name = "${var.project_name}-nat-eip"
  })
}

# NAT Gateway đặt trong public subnet đầu tiên
resource "aws_nat_gateway" "nat_gw" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id # NAT nằm trong public subnet
  tags = merge(var.tags, {
    Name = "${var.project_name}-natgw"
  })
}

# ROUTE TABLES — Quy định đường đi của traffic trong VPC
# Route Table cho public subnet
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"                 # Mọi traffic ra ngoài
    gateway_id = aws_internet_gateway.igw.id # Thông qua Internet Gateway
  }
  tags = merge(var.tags, {
    Name = "${var.project_name}-public-rt"
  })
}

# Route Table cho private subnet
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gw.id
  }
  tags = merge(var.tags, {
    Name = "${var.project_name}-private-rt"
  })
}

# Gắn tất cả public subnet với route table public
resource "aws_route_table_association" "public_assoc" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Gắn tất cả private subnet với route table private
resource "aws_route_table_association" "private_assoc" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# Lấy danh sách AZ khả dụng của region hiện tại
data "aws_availability_zones" "available" {
  state = "available"
}