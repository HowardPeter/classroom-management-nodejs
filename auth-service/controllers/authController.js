import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

import TokenRepository from "../repositories/tokenRepository.js";
import UserRepository from '../repositories/userRepository.js';
import { asyncWrapper } from "#shared/middlewares/index.js"
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  ForbiddenError
} from "#shared/errors/errors.js";
import { createHash, hashToken, generateUuidv4, JwtFacade } from '../utils/index.js';

dotenv.config();

// POST /refresh
// Cấp lại token khi accessToken hết hạn
export const token = asyncWrapper(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) throw new NotFoundError("No token in cookie!");

  // check hash trong Redis có khớp refreshToken không
  const storedHash = await TokenRepository.findRefreshHash(userId, sessionId);
  const cookieHash = hashToken(refreshToken);
  if (!storedHash || storedHash !== cookieHash) {
    res.clearCookie("refreshToken");
    throw new ForbiddenError("Invalid or expired token!");
  }

  // decode token để lấy userId, sessionId
  const decoded = JwtFacade.decodeToken(refreshToken);
  if (!decoded || !decoded.userId || !decoded.sessionId) {
    res.clearCookie("refreshToken");
    throw new ForbiddenError("Invalid token!");
  }
  const { userId, sessionId } = decoded;

  // verify jwt
  try {
    JwtFacade.verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    // xóa nếu token expired/invalid
    await TokenRepository.deleteRefreshHash(userId, sessionId);
    res.clearCookie("refreshToken");
    return res.status(401).json({ msg: "Invalid or expired token!" });
  }

  // Tạo token mới
  const accessToken = JwtFacade.generateAccessToken({ userId, sessionId });
  const newRefreshToken = JwtFacade.generateRefreshToken({ userId, sessionId });

  // Rotate refresh token
  const rotated = await TokenRepository.rotateRefreshHash(userId, sessionId, refreshToken, newRefreshToken);
  if (!rotated) {
    await TokenRepository.deleteAllHash(userId);
    res.clearCookie("refreshToken");
    throw new ForbiddenError("Refresh token reuse detected — all sessions revoked");
  }

  // set cookie sau khi rotate refresh token thành công
  JwtFacade.setRefreshCookie(res, newRefreshToken);

  res.status(200).json({ accessToken, sessionId });
});

// POST /register
// Tạo user mới
export const register = asyncWrapper(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) throw new BadRequestError("Missing required field!");

  const user = await UserRepository.findOne({ username: username })

  if (user) {
    throw new ConflictError("Username existed!");
  }

  const hashedPassword = await createHash(password);
  const newUser = {
    username: username,
    password: hashedPassword
  }
  await UserRepository.createOne(newUser);

  res.status(201).json({ msg: "Register success", newUser });
})

// POST /login
// Đăng nhập
export const login = asyncWrapper(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) throw new BadRequestError("Missing requires field!");

  // check user tồn tại
  const user = await UserRepository.findOne({ username: username });
  if (!user) throw new NotFoundError("Username not found!");

  // check hash password
  const isPassword = await bcrypt.compare(password, user.password);
  if (!isPassword) throw new UnauthorizedError("Invalid password!");

  // tạo token mới với sessionId trong payload
  const sessionId = generateUuidv4();
  const userId = user._id;
  const accessToken = JwtFacade.generateAccessToken({ userId, sessionId });
  const refreshToken = JwtFacade.generateRefreshToken({ userId, sessionId });

  // Lưu refreshToken vào redis và cookie
  await TokenRepository.createRefreshHash(userId, sessionId, refreshToken);
  JwtFacade.setRefreshCookie(res, refreshToken);

  res.status(200).json({ accessToken, sessionId });
})

// POST /password
// Đổi mật khẩu
export const changePassword = asyncWrapper(async (req, res) => {
  const { password } = req.body;
  const userId = req.user.userId;

  if (!userId) throw new InternalServerError("Cannot change password! Required userId is invalid!");
  if (!password) throw new BadRequestError("Missing requires field!");

  const hashedPassword = await createHash(password);
  await UserRepository.updatePasswordById(userId, hashedPassword);

  // revoke toàn bộ refresh token sau khi đổi mật khẩu
  await TokenRepository.deleteAllHash(userId);

  res.status(200).json({ msg: "Change password successfully" });
})

// DELETE /logout
// Đăng xuất và xóa refreshToken
export const logout = asyncWrapper(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) throw new NotFoundError("No token in cookie!");

  const { userId, sessionId } = JwtFacade.verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  // xóa refresh token
  await TokenRepository.deleteRefreshHash(userId, sessionId);
  res.clearCookie("refreshToken");

  res.status(200).json({ msg: "Logged out" });
});

// GET /by-ids
// Lấy tên người dùng bằng id (hàm api)
export const getUsernameByIds = asyncWrapper(async (req, res) => {
  const ids = req.query.ids ? req.query.ids.split(",").filter(id => id.trim() !== "") : [];

  if (!ids || ids.length === 0) throw new BadRequestError("Missing user id!");

  const users = await UserRepository.findNameByIds(ids);

  res.status(200).json(users);
})