import express from 'express';
import { getAllSpareParts,getSparePartById,addToCart } from '../controllers/sparePart.controlller.js';

const router = express.Router();

router.get('/getAllSpareParts', getAllSpareParts);
router.get('/getSparePartById/:id', getSparePartById);
router.post('/addToCart', addToCart);
export default router;
