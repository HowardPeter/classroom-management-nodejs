locals {
  # Chỉnh "true" khi tất cả ECR được tạo và push image
  ecr_enabled = true
}

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

  name               = "${var.project_name}-teacher-function-image-bucket"
  allowed_principals = [module.lambda.lambda_iam_arn.teacher]
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

# NOTE: ECR phải được tạo và push image trước khi tạo Lambda
module "lambda" {
  source = "./modules/lambda"

  project_name = var.project_name
  tags         = var.tags

  ecr_enabled = local.ecr_enabled

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

        PUBLIC_KEY_SECRET_NAME = module.secrets.public_key_secret_name
        SERVICE_SECRET_NAME    = module.secrets.auth_secret_name
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

        PUBLIC_KEY_SECRET_NAME = module.secrets.public_key_secret_name
        SERVICE_SECRET_NAME    = module.secrets.supabase_secret_names.class

        # AWS_REGION = var.aws_region # Bỏ vì AWS tự inject
        # WARN: module không thể gọi output chính nó nên phải hardcode tên function
        # NOTE: Do đó cần hardcode đúng tên function
        TEACHE_SERVICE_API  = "${var.project_name}-lambda-teacher-function"
        STUDENT_SERVICE_API = "${var.project_name}-lambda-student-function"
        USER_SERVICE_API    = "${var.project_name}-lambda-auth-function"
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

        PUBLIC_KEY_SECRET_NAME = module.secrets.public_key_secret_name
        SERVICE_SECRET_NAME    = module.secrets.supabase_secret_names.student
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

        PUBLIC_KEY_SECRET_NAME = module.secrets.public_key_secret_name
        SERVICE_SECRET_NAME    = module.secrets.supabase_secret_names.teacher

        # AWS_REGION = var.aws_region # Bỏ vì AWS tự inject
        AWS_BUCKET_NAME = module.s3_bucket.bucket_name
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

        PUBLIC_KEY_SECRET_NAME = module.secrets.public_key_secret_name
        SERVICE_SECRET_NAME    = module.secrets.supabase_secret_names.tuition

        # AWS_REGION = var.aws_region # Bỏ vì AWS tự inject
        # WARN: Module không thể gọi output chính nó nên phải hardcode tên function
        # NOTE: Do đó cần hardcode đúng tên function
        CLASS_SERVICE_API   = "${var.project_name}-lambda-class-function"
        STUDENT_SERVICE_API = "${var.project_name}-lambda-student-function"
      }
    }
  }

  # Quyền invoke của function -> function(s)
  invoke_permissions = {
    class   = ["tuition"]
    tuition = ["class"]
  }

  s3_arn                = module.s3_bucket.bucket_arn
  auth_secret_arn       = module.secrets.auth_secret_arn
  public_key_secret_arn = module.secrets.public_key_secret_arn
  supabase_secret_arns  = module.secrets.supabase_secret_arns

  # VPC config
  vpc_subnet_ids         = module.networking.private_subnet_ids
  vpc_security_group_ids = [module.networking.lambda_sg_id]
}

module "api_gateway" {
  source = "./modules/api_gateway"

  project_name = var.project_name
  tags         = var.tags

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

  email = "phuocnt1611@gmail.com"

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