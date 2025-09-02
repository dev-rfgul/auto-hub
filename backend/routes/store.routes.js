import express from 'express';
import { registerStore, getStoreById, getProductsByStoreId} from '../controllers/store.controller.js';

const router = express.Router();

router.post('/register', registerStore);
router.get('/getStoreById/:id', getStoreById);
router.get('/getProductsByStoreId/:id', getProductsByStoreId);


export default router;
