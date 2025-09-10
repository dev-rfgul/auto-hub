import express from 'express';
import { getAllSpareParts,getSparePartById,addToCart , getCart } from '../controllers/sparePart.controlller.js';

const router = express.Router();

router.get('/getAllSpareParts', getAllSpareParts);
router.get('/getSparePartById/:id', getSparePartById);
router.post('/addToCart', addToCart);
router.get('/cart/:userId', getCart);
export default router;
