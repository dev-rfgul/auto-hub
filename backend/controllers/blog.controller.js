import Blog from '../models/blog.model.js';
import slugify from 'slugify';

export async function createBlog(req, res) {
  try {
    const { title, content, tags = [], images = [], published = true } = req.body;
    const slug = slugify(title, { lower: true, strict: true });
    const blog = new Blog({
      title,
      slug,
      content,
      author: req.user?._id,
      authorName: req.user?.name || req.body.authorName,
      tags,
      images,
      published,
    });
    await blog.save();
    return res.status(201).json(blog);
  } catch (err) {
    console.error('createBlog error', err);
    return res.status(500).json({ message: err.message || 'Failed to create blog' });
  }
}

export async function listBlogs(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = { published: true };
    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean();
    return res.status(200).json({ total, page: Number(page), limit: Number(limit), blogs });
  } catch (err) {
    console.error('listBlogs error', err);
    return res.status(500).json({ message: err.message || 'Failed to list blogs' });
  }
}

export async function getBlog(req, res) {
  try {
    const { idOrSlug } = req.params;
    const blog = await Blog.findOne({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }).lean();
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    return res.status(200).json(blog);
  } catch (err) {
    console.error('getBlog error', err);
    return res.status(500).json({ message: err.message || 'Failed to get blog' });
  }
}

export async function updateBlog(req, res) {
  try {
    const { id } = req.params;
    const update = { ...req.body, updatedAt: Date.now() };
    const blog = await Blog.findByIdAndUpdate(id, update, { new: true });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    return res.status(200).json(blog);
  } catch (err) {
    console.error('updateBlog error', err);
    return res.status(500).json({ message: err.message || 'Failed to update blog' });
  }
}

export async function deleteBlog(req, res) {
  try {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteBlog error', err);
    return res.status(500).json({ message: err.message || 'Failed to delete blog' });
  }
}
