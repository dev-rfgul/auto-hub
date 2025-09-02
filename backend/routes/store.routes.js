import express from 'express';
import { registerStore, getStoreById} from '../controllers/store.controller.js';

const router = express.Router();

router.post('/register', registerStore);
router.get('/getStoreById/:id', getStoreById);

export default router;
