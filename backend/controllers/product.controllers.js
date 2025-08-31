import SparePart from "../models/sparePart.model.js";
import cloudinary from '../config/cloudinary.js';

const uploadImgsToCloudinary = async (files) => {
    try {
        const uploadPromises = files.map(file =>
            cloudinary.uploader.upload(file.path)
        );
        const results = await Promise.all(uploadPromises);
        return results.map(result => result.secure_url);
    } catch (error) {
        console.error('Error uploading images:', error);
    }
};

export const addSparePart = async (req, res) => {
  try {
    // log incoming payload for debugging
    console.log('addSparePart - req.body:', req.body);
    console.log('addSparePart - req.files:', req.files);

    // parse specifications if provided as JSON string
    let specifications = {};
    if (req.body.specifications) {
      try {
        specifications = typeof req.body.specifications === 'string'
          ? JSON.parse(req.body.specifications)
          : req.body.specifications;
      } catch (e) {
        console.warn('could not parse specifications JSON, using raw value');
        specifications = req.body.specifications;
      }
    }

    // upload files to Cloudinary (if any)
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadImgsToCloudinary(file);
          // store secure_url; you can also save public_id if you need to delete later
          images.push(result.secure_url || result.url);
        } catch (err) {
          console.error('Cloudinary upload failed for file', file.originalname, err);
        }
      }
    }

    // build document payload
    const payload = {
      name: req.body.name,
      partNumber: req.body.partNumber,
      brand: req.body.brand,
      category: req.body.category,
      subcategory: req.body.subcategory,
      description: req.body.description,
      specifications,
      images,
      price: req.body.price ? Number(req.body.price) : undefined,
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
      stockQuantity: req.body.stockQuantity ? Number(req.body.stockQuantity) : undefined,
      storeId: req.body.storeId,
      dealerId: req.body.dealerId,
    };

    const newSparePart = new SparePart(payload);
    await newSparePart.save();
    res.status(201).json(newSparePart);
  } catch (error) {
    console.error('addSparePart error', error);
    res.status(500).json({ message: "Error adding spare part", error: error.message || error });
  }
};
