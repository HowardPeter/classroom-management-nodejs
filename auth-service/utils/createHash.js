import bcrypt from 'bcrypt';
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

export function createHash(value) {
  return bcrypt.hash(value, 10);
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateUuidv4() {
  return uuidv4();
}