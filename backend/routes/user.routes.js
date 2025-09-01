import express from 'express';
import { registerUser, loginUser, getUser} from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user/:id', getUser);

export default router;