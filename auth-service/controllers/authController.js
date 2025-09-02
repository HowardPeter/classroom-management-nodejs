import dotenv from 'dotenv'
import bcrypt from 'bcrypt'

import TokenRepository from "../repositories/tokenRepository.js";
import UserRepository from '../repositories/userRepository.js';
import asyncWrapper from "../middleware/assync-wrapper.js";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError, InternalServerError } from "../errors/errors.js";
import { JwtFacade } from '../utils/jwt.js';
import createHash from '../utils/createHash.js';

dotenv.config();

const createNewRefreshToken = async (token, userId) => {
  const newRefreshToken = {
    refreshToken: token,
    user: userId
  }
  return await TokenRepository.createOne(newRefreshToken);
}

export const token = asyncWrapper(async (req, res) => {
  const tokenCookie = req.cookies.refreshToken;
  if (!tokenCookie)
    return res.status(404).json({ msg: "No token in cookie!" });

  const isRefreshToken = await TokenRepository.findOne({ refreshToken: tokenCookie })
  if (!isRefreshToken)
    return res.status(404).json({ msg: "Token is not available!" });

  let user;
  try {
    user = JwtFacade.verifyToken(tokenCookie, process.env.REFRESH_TOKEN_SECRET);
    console.log("User: ", user);
  } catch (err) {
    await TokenRepository.deleteByToken(tokenCookie); // Xóa token trong db nếu expired
    return res.status(401).json({ msg: "Invalid or expired refresh token" });
  }

  // Rotate refreshToken
  await TokenRepository.deleteByToken(tokenCookie);
  const { accessToken, refreshToken } = await JwtFacade.setTokens(res, user.userId)
  await createNewRefreshToken(refreshToken, user.userId);

  res.status(200).json({ accessToken });
});

export const register = asyncWrapper(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new BadRequestError("Missing required field") // 400
  }

  const user = await UserRepository.findOne({ username: username })

  if (user) {
    throw new ConflictError("Username existed!") // 409
  }

  const hashedPassword = await createHash(password);
  const newUser = {
    username: username,
    password: hashedPassword
  }
  await UserRepository.createOne(newUser);
  res.status(201).json({ msg: "Register success", newUser });
})

export const login = asyncWrapper(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    throw new BadRequestError("Missing requires field");

  const user = await UserRepository.findOne({ username: username });
  if (!user)
    throw new NotFoundError("Username not found!");

  const isPassword = await bcrypt.compare(password, user.password);
  if (!isPassword)
    throw new UnauthorizedError("Invalid password!");

  const { accessToken, refreshToken } = await JwtFacade.setTokens(res, user._id);
  await createNewRefreshToken(refreshToken, user._id)

  res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken });
})

export const changePassword = asyncWrapper(async (req, res) => {
  const { password } = req.body;
  const userId = req.user.userId;

  if (!userId)
    throw new InternalServerError("Required userId is invalid!")

  if (!password)
    throw new BadRequestError("Missing requires field");

  const hashedPassword = await createHash(password);
  await UserRepository.updatePasswordById(userId, hashedPassword);

  res.status(200).json({ msg: "Change password successfully" });
})

export const logout = asyncWrapper(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(404).json({ msg: "No token in cookie" });

  console.log(refreshToken);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  const isRefreshToken = await TokenRepository.findOne({ refreshToken: refreshToken })
  if (!isRefreshToken)
    return res.status(403).json({ msg: "Invalid or expired token" });

  await TokenRepository.deleteByToken(refreshToken);

  res.status(200).json({ msg: "Logout successfully" });
})

export const getUsernameByIds = asyncWrapper(async (req, res) => {
  const ids = req.query.ids ? req.query.ids.split(",").filter(id => id.trim() !== "") : [];

  if (!ids || ids.length === 0)
    return res.status(400).json({
      success: false,
      msg: "Missing ids"
    });

  const users = await UserRepository.findNameByIds(ids);

  res.status(200).json(users);
})