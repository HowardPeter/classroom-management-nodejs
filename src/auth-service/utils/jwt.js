import jwt from "jsonwebtoken"
import fs from 'fs'
import { SecretService } from "#shared/utils/index.js"

const secret = await SecretService.getSecret(process.env.SERVICE_SECRET_NAME);

export default class JwtFacade {
  static ACCESS_TOKEN_SECRET = secret.PRIVATE_KEY || fs.readFileSync("private.pem", "utf8");
  static REFRESH_TOKEN_SECRET = secret.REFRESH_TOKEN_SECRET || process.env.REFRESH_TOKEN_SECRET;
  static accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '1h';
  static refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';

  static verifyToken(token, secret, options = {}) {
    return jwt.verify(token, secret, options);
  }

  static decodeToken(token) {
    return jwt.decode(token);
  }

  static generateAccessToken(payload) {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      algorithm: "RS256",
      expiresIn: this.accessTokenExpiry,
    });
  }

  static generateRefreshToken(payload) {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.refreshTokenExpiry,
    });
  }

  static setRefreshCookie(res, refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}