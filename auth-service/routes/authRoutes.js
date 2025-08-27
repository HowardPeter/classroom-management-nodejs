import express from 'express'
import { login, logout, register, token, changePassword } from '../controllers/AuthController.js'
import authentication from '../middleware/authentication.js'

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', token);
router.delete('/logout', logout);
router.patch('/password', authentication, changePassword);

export default router;