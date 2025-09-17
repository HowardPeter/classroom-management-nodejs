import jwt from 'jsonwebtoken'
import { UnauthorizedError } from '#shared/errors/errors.js';
import fs from 'fs';

export default function authentication(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    throw new UnauthorizedError("Authorization header required!")

  const token = authHeader && authHeader.split(' ')[1]

  if (!token)
    return res.status(401).json({ message: "Token missing!" });

  const publicKey = fs.readFileSync("public.pem", "utf8");
  jwt.verify(token, publicKey, { algorithms: ["RS256"] }, (err, user) => {
    if (err) {
      return next(err)
    }
    req.user = user;
    next();
  })
}