import express from "express";
import { addSparePart } from "../controllers/product.controllers.js";
const router = express.Router();

router.post("/add-spare-part", addSparePart);
export default router;