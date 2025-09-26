import express from "express";
import multer from 'multer';
import { 
  addSparePart, 
  editSparePart, 
  deleteSparePart, 
  getSparePart, 
  getAllSpareParts,
  getSparePartsByStoreId 
} from "../controllers/product.controllers.js";
const router = express.Router();

// use memory storage so files are available as buffers for Cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Accept multiple images in field 'images'
router.post("/add-spare-part", upload.array('images', 8), addSparePart);
router.put("/edit-spare-part/:id", upload.array('images', 8), editSparePart);
router.delete("/delete-spare-part/:id", deleteSparePart);
router.get("/spare-part/:id", getSparePart);
router.get("/spare-parts", getAllSpareParts);
router.get("/store/:storeId/spare-parts", getSparePartsByStoreId);

export default router;