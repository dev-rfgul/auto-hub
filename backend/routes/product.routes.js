import express from "express";
import multer from 'multer';
import { addSparePart } from "../controllers/product.controllers.js";
const router = express.Router();

// use memory storage so files are available as buffers for Cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Accept multiple images in field 'images'
router.post("/add-spare-part", upload.array('images', 8), addSparePart);

export default router;