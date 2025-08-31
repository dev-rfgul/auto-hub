import express from 'express';
import { verifyDealer,getAllDealers,getAllStores,verifyStore,createAdmin,loginAdmin } from '../controllers/admin.controller.js';

const router = express.Router();

router.post('/create-admin',createAdmin);
router.post('/login-admin',loginAdmin);
router.get('/getAllDealers',getAllDealers)
router.get('/getAllStores',getAllStores)
router.post('/verify-dealer/:dealerId/:action', verifyDealer);
router.post('/verify-store/:storeId/:action', verifyStore);

export default router;