import express from 'express';
import { registerDealer } from '../controllers/dealer.controller.js';

const router = express.Router();

router.post('/register', registerDealer);

export default router;