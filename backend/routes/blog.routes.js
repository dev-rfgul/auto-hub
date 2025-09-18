import express from 'express';
import { createBlog, listBlogs, getBlog, updateBlog, deleteBlog } from '../controllers/blog.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authRole.js';

const router = express.Router();

// Public: list and get
router.get('/', listBlogs);
router.get('/:idOrSlug', getBlog);

// Protected: create/update/delete for dealers/admins
router.post('/', requireAuth, requireRole(['dealer','admin']), createBlog);
router.put('/:id', requireAuth, requireRole(['dealer','admin']), updateBlog);
router.delete('/:id', requireAuth, requireRole(['dealer','admin']), deleteBlog);

export default router;
