import Blog from '../models/blog.model.js';
import slugify from 'slugify';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

const uploadImgsToCloudinary = async (files) => {
  try {
    const list = Array.isArray(files) ? files : [files];
    const urls = [];
    for (const file of list) {
      try {
        if (file.path) {
          const result = await cloudinary.uploader.upload(file.path, { folder: 'auto-hub/blogs' });
          urls.push(result.secure_url || result.url);
          continue;
        }
        if (file.buffer) {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: 'auto-hub/blogs' }, (err, result) => {
              if (err) return reject(err);
              resolve(result);
            });
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
          });
          urls.push(result.secure_url || result.url);
          continue;
        }
        console.warn('Skipping file without path or buffer');
      } catch (fileErr) {
        console.error('file upload failed, continuing with next file', fileErr);
      }
    }
    return urls;
  } catch (error) {
    console.error('Error uploading images:', error);
    return [];
  }
};

export async function createBlog(req, res) {
  try {
    // Debug logs to inspect incoming request when body appears empty
    try {
      console.log('--- createBlog received request ---');
      console.log('method:', req.method, 'url:', req.originalUrl || req.url);
      console.log('headers:', Object.keys(req.headers).reduce((acc, k) => { acc[k]=req.headers[k]; return acc; }, {}));
      console.log('content-type:', req.headers && req.headers['content-type']);
      console.log('req.is multipart/form-data?:', typeof req.is === 'function' ? req.is('multipart/form-data') : 'n/a');
      console.log('req.body type:', typeof req.body);
      // try safe inspect of body
      try { console.log('req.body:', req.body); } catch (e) { console.log('req.body inspect failed', e); }
      console.log('req.files:', Array.isArray(req.files) ? `array(${req.files.length})` : req.files);
      console.log('req.cookies keys:', req.cookies ? Object.keys(req.cookies) : []);
    } catch (dbgErr) {
      console.error('createBlog debug logging error', dbgErr);
    }

    // if multipart/form-data, ensure body exists
    const body = req.body || {};

    console.log(body)
    // parse tags: can be provided as tags[] (FormData) or comma-separated string
    let tags = [];
    if (Array.isArray(body.tags)) tags = body.tags.filter(Boolean);
    else if (typeof body['tags[]'] !== 'undefined') {
      // some clients send tags[] keys
      tags = Array.isArray(body['tags[]']) ? body['tags[]'].filter(Boolean) : [body['tags[]']].filter(Boolean);
    } else if (typeof body.tags === 'string') {
      tags = body.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    // handle images uploaded via multer (req.files)
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await uploadImgsToCloudinary(req.files);
    } else if (body.images && Array.isArray(body.images)) {
      images = body.images;
    }

    const title = body.title || '';
    const content = body.content || '';
    const published = (typeof body.published !== 'undefined') ? (String(body.published) === 'true' || body.published === true) : true;

    if (!title) return res.status(400).json({ message: 'title is required' });

    const slug = slugify(title, { lower: true, strict: true });
    const blog = new Blog({
      title,
      slug,
      content,
      author: req.user?._id,
      authorName: req.user?.name || body.authorName,
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
    const { id } = req.params;

    const blog = await Blog.findById(id).lean();
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
