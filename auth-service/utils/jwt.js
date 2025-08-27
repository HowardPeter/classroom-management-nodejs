import jwt from "jsonwebtoken"
import dotenv from 'dotenv'

dotenv.config()

export class JwtFacade {
  static ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
  static REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
  static accessTokenExpiry = '15s';
  static refreshTokenExpiry = '20s';

  static verifyToken(token, secret) {
    return jwt.verify(token, secret);
  }

  static generateAccessToken(payload) {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, { expiresIn: this.accessTokenExpiry });
  }

  static generateRefreshToken(payload) {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, { expiresIn: this.refreshTokenExpiry });
  }
}