import express from 'express'
import { login, logout, register, token, changePassword, getUsernameByIds } from '../controllers/authController.js'
import authentication from '../middlewares/authentication.js'

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', token);
router.delete('/logout', logout);
router.patch('/password', authentication, changePassword);
router.get('/by-ids', getUsernameByIds);

export default router;