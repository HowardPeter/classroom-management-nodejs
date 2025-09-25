import jwt from "jsonwebtoken"
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

export default class JwtFacade {
  static ACCESS_TOKEN_SECRET = fs.readFileSync("private.pem", "utf8");;
  static REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
  static accessTokenExpiry = '1h';
  static refreshTokenExpiry = '7d';

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