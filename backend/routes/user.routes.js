import express from 'express';
import { registerUser, loginUser, getUser, getMe, logoutUser } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user/:id', getUser);
router.get('/me', getMe);
router.post('/logout', logoutUser);

export default router;