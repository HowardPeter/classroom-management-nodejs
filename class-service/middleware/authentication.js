import jwt from 'jsonwebtoken'
import { InternalServerError } from '../errors/errors.js';
import fs from 'fs';

export default function authentication(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    throw new InternalServerError("Authorization header required!")

  const token = authHeader && authHeader.split(' ')[1]

  if (!token)
    return res.status(401);

  const publicKey = fs.readFileSync("public.pem", "utf8");
  jwt.verify(token, publicKey, { algorithms: ["RS256"] }, (err, user) => {
    if (err) {
      return next(err)
    }
    req.user = user;
    next();
  })
}