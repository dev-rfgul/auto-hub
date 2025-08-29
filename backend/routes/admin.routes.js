import express from 'express';
import { verifyDealer,getAllDealers,getAllStores } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/getAllDealers',getAllDealers)
router.get('/getAllStores',getAllStores)
router.post('/verify-dealer/:dealerId/:action', verifyDealer);

export default router;