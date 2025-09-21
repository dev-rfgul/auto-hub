import express from 'express';
import multer from 'multer';
import { createBlog, listBlogs, getBlog, updateBlog, deleteBlog } from '../controllers/blog.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authRole.js';

const router = express.Router();

// Public: list and get
router.get('/', listBlogs);
router.get('/:id', getBlog);

// Protected: create/update/delete for dealers/admins
// parse multipart/form-data with multer (memory storage so buffers available for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });
router.post('/add-blog', requireAuth, requireRole(['dealer','admin']), upload.array('images', 6), createBlog);
router.put('/:id', requireAuth, requireRole(['dealer','admin']), updateBlog);
router.delete('/:id', requireAuth, requireRole(['dealer','admin']), deleteBlog);

export default router;
