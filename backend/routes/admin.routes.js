import express from 'express';
import { verifyDealer,getAllDealers } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/getAllDealers',getAllDealers)
router.post('/verify-dealer/:dealerId', verifyDealer);

export default router;