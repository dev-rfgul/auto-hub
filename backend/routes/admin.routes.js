import express from 'express';
import { verifyDealer } from '../controllers/admin.controller.js';

const router = express.Router();

router.post('/verify-dealer/:dealerId', verifyDealer);

export default router;