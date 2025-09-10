import express from 'express';
import { getAllSpareParts,getSparePartById,addToCart , getCart,checkout ,removeFromCart} from '../controllers/sparePart.controlller.js';

const router = express.Router();

router.get('/getAllSpareParts', getAllSpareParts);
router.get('/getSparePartById/:id', getSparePartById);
router.post('/addToCart', addToCart);
router.get('/cart/:userId', getCart);
router.post('/checkout',checkout);
router.post('/removeFromCart', removeFromCart)

export default router;
