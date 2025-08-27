import bcrypt from 'bcrypt'

export default function createHash(value) {
  return bcrypt.hash(value, 10);
}