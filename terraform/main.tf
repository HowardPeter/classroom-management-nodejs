module "networking" {
  source = "./modules/networking"

  project_name = var.project_name
  tags         = var.tags

  region = var.aws_region

  vpc_cidr        = "10.0.0.0/16"
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.3.0/24", "10.0.4.0/24"]
}

module "s3_bucket" {
  source = "./modules/s3"

  project_name = var.project_name
  tags         = var.tags

  name               = "teacher-service"
  allowed_principals = []
}

module "secrets" {
  source = "./modules/secret_manager"

  project_name = var.project_name
  tags         = var.tags

  auth_service = {
    mongo_username       = "${var.auth.mongo_username}"
    mongo_password       = "${var.auth.mongo_password}"
    mongo_host           = "${var.auth.mongo_host}"
    private_key          = file("./key/private.pem")
    refresh_token_secret = "${var.auth.refresh_token_secret}"
  }

  supabase_services = {
    student = {
      database_url = "${var.student_db_url}"
      direct_url   = "${var.student_direct_url}"
    }
    teacher = {
      database_url = "${var.teacher_db_url}"
      direct_url   = "${var.teacher_direct_url}"
    }
    class = {
      database_url = "${var.class_db_url}"
      direct_url   = "${var.class_direct_url}"
    }
    tuition = {
      database_url = "${var.tuition_db_url}"
      direct_url   = "${var.tuition_direct_url}"
    }
  }

  public_key = file("./key/public.pem")
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  tags         = var.tags

  services = [
    "auth-service",
    "class-service",
    "student-service",
    "tuition-service",
    "teacher-service"
  ]
}

module "elasticache" {
  source = "./modules/elasticache"

  project_name = var.project_name
  tags         = var.tags

  engine = "valkey"

  cache_storage_max_gb = 10
  ecpu_per_second_max  = 5000

  major_engine_version     = "7"
  kms_key_id               = null
  daily_snapshot_time      = "05:00"
  snapshot_retention_limit = 1

  security_group_ids = [module.networking.elasticache_sg_id]
  subnet_ids         = module.networking.private_subnet_ids
}

module "lambda" {
  source = "./modules/lambda"

  project_name = var.project_name
  tags         = var.tags

  lambda_services = {
    auth = {
      image         = module.ecr.repository_urls["auth-service"]
      memory        = 1024
      timeout       = 10
      architectures = ["arm64"]
      environment = {
        REDIS_HOST   = module.elasticache.endpoint_address
        REDIS_PORT   = module.elasticache.endpoint_port
        REDIS_PREFIX = "userSv:"
      }
    }
    class = {
      image         = module.ecr.repository_urls["class-service"]
      memory        = 512
      timeout       = 10
      architectures = ["arm64"]
      environment = {
        REDIS_HOST   = module.elasticache.endpoint_address
        REDIS_PORT   = module.elasticache.endpoint_port
        REDIS_PREFIX = "classSv:"
      }
    }
    student = {
      image         = module.ecr.repository_urls["student-service"]
      memory        = 512
      timeout       = 10
      architectures = ["arm64"]
      environment = {
        REDIS_HOST   = module.elasticache.endpoint_address
        REDIS_PORT   = module.elasticache.endpoint_port
        REDIS_PREFIX = "studentSv:"
      }
    }
    teacher = {
      image         = module.ecr.repository_urls["teacher-service"]
      memory        = 512
      timeout       = 10
      architectures = ["arm64"]
      environment = {
        REDIS_HOST   = module.elasticache.endpoint_address
        REDIS_PORT   = module.elasticache.endpoint_port
        REDIS_PREFIX = "teacherSv:"
      }
    }
    tuition = {
      image         = module.ecr.repository_urls["tuition-service"]
      memory        = 512
      timeout       = 10
      architectures = ["arm64"]
      environment = {
        REDIS_HOST   = module.elasticache.endpoint_address
        REDIS_PORT   = module.elasticache.endpoint_port
        REDIS_PREFIX = "tuitionSv:"
      }
    }
  }

  s3_arn                = module.s3_bucket.bucket_arn
  auth_secret_arn       = module.secrets.auth_secret_arn
  public_key_secret_arn = module.secrets.public_key_secret_arn
  supabase_secret_arns  = module.secrets.supabase_secret_arns
}

module "api_gateway" {
  source = "./modules/api_gateway"

  project_name = var.project_name
  tags         = var.tags

  cloudwatch_log_group = module.cloudwatch.apigateway_log_group

  api_routes = {
    auth = {
      prefix_path       = "/users"
      lambda_invoke_arn = module.lambda.lambda_functions.auth.invoke_arn
      lambda_arn        = module.lambda.lambda_functions.auth.arn
    }
    class = {
      prefix_path       = "/classes"
      lambda_invoke_arn = module.lambda.lambda_functions.class.invoke_arn
      lambda_arn        = module.lambda.lambda_functions.class.arn
    }
    student = {
      prefix_path       = "/students"
      lambda_invoke_arn = module.lambda.lambda_functions.student.invoke_arn
      lambda_arn        = module.lambda.lambda_functions.student.arn
    }
    teacher = {
      prefix_path       = "/teachers"
      lambda_invoke_arn = module.lambda.lambda_functions.teacher.invoke_arn
      lambda_arn        = module.lambda.lambda_functions.teacher.arn
    }
    tuition = {
      prefix_path       = "/tuition"
      lambda_invoke_arn = module.lambda.lambda_functions.tuition.invoke_arn
      lambda_arn        = module.lambda.lambda_functions.tuition.arn
    }
  }
}

module "cloudwatch" {
  source = "./modules/cloudwatch"

  project_name = var.project_name
  tags         = var.tags

  function_name = {
    auth    = module.lambda.lambda_functions.auth.name
    class   = module.lambda.lambda_functions.class.name
    student = module.lambda.lambda_functions.student.name
    teacher = module.lambda.lambda_functions.teacher.name
    tuition = module.lambda.lambda_functions.tuition.name
  }

  apigw = {
    api_name  = module.api_gateway.api_name
    api_id    = module.api_gateway.api_id
    api_stage = module.api_gateway.stage_name
  }

  cache_serverless_name = module.elasticache.cache_name
}