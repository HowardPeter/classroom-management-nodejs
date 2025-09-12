import dotenv from 'dotenv'
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

dotenv.config()

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

export default class S3Service {
  static s3Client() {
    return new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    })
  }

  static async uploadFile(fileBuffer, fileName, mimeType) {
    const uploadParams = {
      Bucket: bucketName,
      Body: fileBuffer,
      Key: fileName,
      ContentType: mimeType
    }
    return this.s3Client().send(new PutObjectCommand(uploadParams));
  }

  static async deleteFile(fileName) {
    const deleteParams = {
      Bucket: bucketName,
      Key: fileName,
    }

    return this.s3Client().send(new DeleteObjectCommand(deleteParams));
  }

  static async getObjectSignedUrl(key) {
    const params = {
      Bucket: bucketName,
      Key: key
    }

    const command = new GetObjectCommand(params);
    const seconds = 120;
    const url = await getSignedUrl(this.s3Client(), command, { expiresIn: seconds });

    return url;
  }
}