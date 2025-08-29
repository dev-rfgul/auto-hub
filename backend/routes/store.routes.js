import express from 'express';
import { registerStore } from '../controllers/store.controller.js';

const router = express.Router();

router.post('/register', registerStore);

export default router;
