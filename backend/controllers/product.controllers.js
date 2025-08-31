import SparePart from "../models/sparePart.model.js";
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

const uploadImgsToCloudinary = async (files) => {
  // Upload files sequentially (not in parallel) to reduce connection/timeouts on Cloudinary
  try {
    const list = Array.isArray(files) ? files : [files];
    const urls = [];

    for (const file of list) {
      try {
        console.log(`uploading file to cloudinary: name=${file.originalname || file.name} size=${file.size || (file.buffer && file.buffer.length)}`);

        // if multer stored file on disk
        if (file.path) {
          const result = await cloudinary.uploader.upload(file.path, { folder: 'auto-hub/spareparts' });
          urls.push(result.secure_url || result.url);
          continue;
        }

        // if memory buffer, stream it
        if (file.buffer) {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: 'auto-hub/spareparts' }, (err, result) => {
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
        // continue with next file rather than failing all
      }
    }

    return urls;
  } catch (error) {
    console.error('Error uploading images:', error);
    return [];
  }
};

export const addSparePart = async (req, res) => {
  try {
  // log incoming payload and headers for debugging
  console.log('addSparePart - headers content-type:', req.headers['content-type']);
  console.log('addSparePart - is multipart:', req.is && req.is('multipart/form-data'));
  console.log('addSparePart - req.body:', req.body);
  console.log('addSparePart - req.files:', req.files);

    // guard for missing body (e.g., when multipart not parsed)
    const body = req.body || {};

    // parse specifications if provided as JSON string
    let specifications = {};
    if (body.specifications) {
      try {
        specifications = typeof body.specifications === 'string'
          ? JSON.parse(body.specifications)
          : body.specifications;
      } catch (e) {
        console.warn('could not parse specifications JSON, using raw value');
        specifications = body.specifications;
      }
    }

    // upload files to Cloudinary (if any)
    // upload files to Cloudinary (if any)
    let images = [];
    if (req.files && req.files.length > 0) {
      const urls = await uploadImgsToCloudinary(req.files);
      images = urls;
    }

    // build document payload
    const payload = {
      name: body.name,
      partNumber: body.partNumber,
      brand: body.brand,
      category: body.category,
      subcategory: body.subcategory,
      description: body.description,
      specifications,
      images,
      price: body.price ? Number(body.price) : undefined,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      stockQuantity: body.stockQuantity ? Number(body.stockQuantity) : undefined,
      // take storeId from incoming body; if empty string, treat as undefined
      storeId: body.storeId || undefined,
      dealerId: body.dealerId || undefined,
    };

    // validate required relational fields
    if (!payload.storeId) {
      console.warn('storeId missing in payload:', body);
      return res.status(400).json({ message: 'storeId is required' });
    }

    const newSparePart = new SparePart(payload);
    await newSparePart.save();
    res.status(201).json(newSparePart);
  } catch (error) {
    console.error('addSparePart error', error);
    res.status(500).json({ message: "Error adding spare part", error: error.message || error });
  }
};
