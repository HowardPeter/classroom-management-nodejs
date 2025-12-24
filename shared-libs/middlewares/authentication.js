import jwt from 'jsonwebtoken'
import fs from 'fs';
import { UnauthorizedError } from '#shared/errors/errors.js';
import { SecretService } from "#shared/utils/index.js"

export default async function authentication(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    throw new UnauthorizedError("Authorization header required!")

  const token = authHeader && authHeader.split(' ')[1]

  if (!token)
    return res.status(401).json({ message: "Token missing!" });

  // NOTE: RSA key cần xuống dòng đúng để RS256 verify hợp lệ, key lưu ở AWS Secret Manager NHẬP BẰNG PLAINTEXT, chuyển thành 1 dòng và \n ở nơi xuống dòng
  // NOTE: {"PUBLIC_KEY": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A\n...-----END PUBLIC KEY-----"}
  var publickey;
  if (process.env.NODE_ENV === 'production') {
    const secret = await SecretService.getSecret(process.env.PUBLIC_KEY_SECRET_NAME);
    publickey = secret.PUBLIC_KEY;
  } else {
    publickey = fs.readFileSync("public.pem", "utf8");
  }

  jwt.verify(token, publickey, { algorithms: ["RS256"] }, (err, user) => {
    if (err) {
      return next(err)
    }
    req.user = user;
    next();
  })
}