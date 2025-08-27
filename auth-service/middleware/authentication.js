import jwt from 'jsonwebtoken'
import { InternalServerError } from '../errors/errors.js';

export default function authentication(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    throw new InternalServerError("Authorization header required!")

  const token = authHeader && authHeader.split(' ')[1]

  if (!token)
    return res.status(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return next(err)
    }
    req.user = user;
    next();
  })
}