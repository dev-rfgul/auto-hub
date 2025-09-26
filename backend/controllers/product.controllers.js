import SparePart from "../models/sparePart.model.js";
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import Store from "../models/store.model.js";

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
        // add product Id to the store as well
    if (payload.storeId) {
      const store = await Store.findById(payload.storeId);
      if (!store) {
        console.warn('store not found for id:', payload.storeId);
        return res.status(404).json({ message: 'Store not found' });
      }
      store.sparePartsId.push(newSparePart._id);
      await store.save();
    }
    res.status(201).json(newSparePart);
  } catch (error) {
    console.error('addSparePart error', error);
    res.status(500).json({ message: "Error adding spare part", error: error.message || error });
  }
};

export const editSparePart = async (req, res) => {
  try {
    const { id } = req.params;
    
    // log incoming payload for debugging
    console.log('editSparePart - headers content-type:', req.headers['content-type']);
    console.log('editSparePart - req.body:', req.body);
    console.log('editSparePart - req.files:', req.files);

    // Find the existing spare part
    const existingSparePart = await SparePart.findById(id);
    if (!existingSparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    // guard for missing body
    const body = req.body || {};

    // parse specifications if provided as JSON string
    let specifications = existingSparePart.specifications;
    if (body.specifications) {
      try {
        specifications = typeof body.specifications === 'string'
          ? JSON.parse(body.specifications)
          : body.specifications;
      } catch (e) {
        console.warn('could not parse specifications JSON, keeping existing value');
      }
    }

    // handle image uploads
    let images = existingSparePart.images || [];
    if (req.files && req.files.length > 0) {
      const newUrls = await uploadImgsToCloudinary(req.files);
      // You can choose to append or replace images
      // For replace: images = newUrls;
      // For append: images = [...images, ...newUrls];
      images = newUrls.length > 0 ? newUrls : images;
    }

    // build update payload - only update fields that are provided
    const updatePayload = {};
    
    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.partNumber !== undefined) updatePayload.partNumber = body.partNumber;
    if (body.brand !== undefined) updatePayload.brand = body.brand;
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.subcategory !== undefined) updatePayload.subcategory = body.subcategory;
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.specifications !== undefined) updatePayload.specifications = specifications;
    if (body.price !== undefined) updatePayload.price = Number(body.price);
    if (body.originalPrice !== undefined) updatePayload.originalPrice = Number(body.originalPrice);
    if (body.stockQuantity !== undefined) updatePayload.stockQuantity = Number(body.stockQuantity);
    if (body.status !== undefined) updatePayload.status = body.status;
    if (images.length > 0) updatePayload.images = images;
    
    // always update the updatedAt field
    updatePayload.updatedAt = Date.now();

    // update the spare part
    const updatedSparePart = await SparePart.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedSparePart);
  } catch (error) {
    console.error('editSparePart error', error);
    
    // Handle duplicate key error (partNumber must be unique)
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Part number already exists', 
        error: 'Duplicate part number' 
      });
    }
    
    res.status(500).json({ 
      message: "Error updating spare part", 
      error: error.message || error 
    });
  }
};

export const deleteSparePart = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the spare part to get storeId before deletion
    const sparePart = await SparePart.findById(id);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    const storeId = sparePart.storeId;

    // Delete the spare part
    await SparePart.findByIdAndDelete(id);

    // Remove the spare part ID from the store's sparePartsId array
    if (storeId) {
      try {
        const store = await Store.findById(storeId);
        if (store) {
          store.sparePartsId = store.sparePartsId.filter(
            partId => partId.toString() !== id
          );
          await store.save();
        }
      } catch (storeError) {
        console.warn('Error updating store after spare part deletion:', storeError);
        // Continue with successful deletion even if store update fails
      }
    }

    res.status(200).json({ 
      message: 'Spare part deleted successfully',
      deletedId: id 
    });
  } catch (error) {
    console.error('deleteSparePart error', error);
    res.status(500).json({ 
      message: "Error deleting spare part", 
      error: error.message || error 
    });
  }
};

export const getSparePart = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sparePart = await SparePart.findById(id).populate('storeId', 'name address');
    
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    res.status(200).json(sparePart);
  } catch (error) {
    console.error('getSparePart error', error);
    res.status(500).json({ 
      message: "Error fetching spare part", 
      error: error.message || error 
    });
  }
};

export const getAllSpareParts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      brand, 
      storeId, 
      search,
      minPrice,
      maxPrice,
      status = 'active'
    } = req.query;

    // Build filter object
    const filter = { status };
    
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (storeId) filter.storeId = storeId;
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Search filter (name, description, partNumber)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const spareParts = await SparePart.find(filter)
      .populate('storeId', 'name address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await SparePart.countDocuments(filter);
    
    res.status(200).json({
      spareParts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('getAllSpareParts error', error);
    res.status(500).json({ 
      message: "Error fetching spare parts", 
      error: error.message || error 
    });
  }
};

// get product by store id
export const getSparePartsByStoreId = async (req, res) => {
  try {
    const { storeId } = req.params;
    
    console.log('getSparePartsByStoreId - storeId:', storeId);
    
    if (!storeId) {
      return res.status(400).json({ message: 'storeId is required' });
    }

    // Validate if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Get query parameters for additional filtering
    const { 
      page = 1, 
      limit = 10, 
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      status = 'active'
    } = req.query;

    // Build filter object
    const filter = { storeId, status };
    
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Search filter (name, description, partNumber)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Filter applied:', filter);

    const skip = (Number(page) - 1) * Number(limit);
    
    const spareParts = await SparePart.find(filter)
      .populate('storeId', 'name address contactInfo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await SparePart.countDocuments(filter);
    
    console.log(`Found ${spareParts.length} spare parts for store ${storeId}`);

    res.status(200).json({
      spareParts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      },
      store: {
        id: store._id,
        name: store.name,
        address: store.address
      }
    });
  } catch (error) {
    console.error('getSparePartsByStoreId error', error);
    res.status(500).json({ 
      message: "Error fetching spare parts by store", 
      error: error.message || error 
    });
  }
};
