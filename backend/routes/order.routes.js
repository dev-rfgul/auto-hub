import express from 'express';

const router = express.Router();

import { getOrder, getOrdersByUserId, getAllOrders,getOrdersByStoreId } from '../controllers/order.controller.js';

router.get('/getOrderById/:id', getOrder);
router.get('/getOrderByUserId/:userId', getOrdersByUserId);
router.get('/getAllOrders', getAllOrders);
router.get('/getOrdersByStoreId/:storeId', getOrdersByStoreId);
export default router;