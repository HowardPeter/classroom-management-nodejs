module "networking" {
  source          = "./modules/networking"
  project_name    = var.project_name
  vpc_cidr        = var.vpc_cidr
  public_subnets  = var.public_subnets
  private_subnets = var.private_subnets
  tags            = var.tags
}

module "s3_bucket" {
  source = "./modules/s3"
  project_name    = var.project_name
  tags = var.tags
}