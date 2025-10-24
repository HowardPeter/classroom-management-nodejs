import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

// NOTE: Configure aws cli để aws tự động lấy access key hoặc thêm credential khi tạo SecretsManagerClient (dev env)
export default class SecretService {
  static async getSecret(secretName) {
    if (process.env.NODE_ENV !== "production")
      return {};

    const client = new SecretsManagerClient({
      region: "ap-southeast-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });
    const res = await client.send(new GetSecretValueCommand({ SecretId: secretName }));

    return JSON.parse(res.SecretString || "{}");
  }

  static async setDatabaseUrl(secretName) {
    if (process.env.NODE_ENV !== "production")
      return;

    const secret = await this.getSecret(secretName);
    const databaseUrl = secret.DATABASE_URL;
    process.env.DATABASE_URL = databaseUrl;
  }
}

// let cachedSecret = null;
// let loadingPromise = null;

// Tạo singleton để load và cache 1 secret instance duy nhất
// Gọi 1 lần khi app start
// export async function getSecret(secretName) {
//   try {
//     if (cachedSecret) return cachedSecret;

//     if (!loadingPromise) {
//       // Gọi promise khi chưa cache để load secret
//       loadingPromise = (async () => {
//         const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
//         cachedSecret = JSON.parse(response.SecretString || "{}");

//         return cachedSecret;
//       })();
//     }
//     return loadingPromise; // Các module gọi cùng lúc sẽ chờ cùng 1 promise
//   } catch (error) {
//     throw new InternalServerError("Error fetching hosted secrets: ", error);
//   }
// }
