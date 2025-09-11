import express from 'express';

const router = express.Router();

import { getOrder, getOrdersByUserId, getAllOrders } from '../controllers/order.controller.js';

router.get('/getOrderById/:id', getOrder);
router.get('/getOrderByUserId/:userId', getOrdersByUserId);
router.get('/getAllOrders', getAllOrders);

export default router;