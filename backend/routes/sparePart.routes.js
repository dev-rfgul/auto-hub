import express from 'express';
import { getAllSpareParts,getSparePartById } from '../controllers/sparePart.controlller';

const router = express.Router();

router.get('/getAllSpareParts', getAllSpareParts);
router.get('/getSparePartById/:id', getSparePartById);

export default router;
