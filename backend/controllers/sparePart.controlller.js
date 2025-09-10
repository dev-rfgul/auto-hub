import SparePart from "../models/sparePart.model.js";
import Order from "../models/order.model.js";


//get all spareparts
export const getAllSpareParts = async (req, res) => {
  try {
    const spareParts = await SparePart.find();
    res.status(200).json(spareParts);
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    res.status(500).json({ message: 'Error fetching spare parts', error: error.message });
  }
};

//get sparepart by id
export const getSparePartById = async (req, res) => {
  try {
    const { id } = req.params;
    const sparePart = await SparePart.findById(id);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    res.status(200).json(sparePart);
  } catch (error) {
    console.error('Error fetching spare part by id:', error);
    res.status(500).json({ message: 'Error fetching spare part by id', error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // resolve user id from auth middleware, cookie, or body
    let userId = null;
    if (req.user && req.user._id) userId = req.user._id;
    else if (req.body.userId) userId = req.body.userId;
    else if (req.cookies?.user) {
      try { userId = JSON.parse(req.cookies.user)._id; } catch (e) {}
    }
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // fetch product details
    const product = await SparePart.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // check stock availability
    if (product.stockQuantity != null && product.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // find or create cart (using Order with status: "cart")
    let cart = await Order.findOne({ userId, status: "cart" });
    
    if (!cart) {
      // create new cart
      const itemSnapshot = {
        sparePartId: product._id,
        storeId: product.storeId,
        name: product.name || product.partNumber,
        brand: product.brand,
        sku: product.partNumber,
        price: Number(product.price || 0),
        quantity: Number(quantity)
      };
      
      cart = await Order.create({
        userId,
        items: [itemSnapshot],
        totalAmount: itemSnapshot.price * itemSnapshot.quantity,
        status: "cart"
      });
      
      return res.status(201).json({ 
        message: 'Product added to cart', 
        cart: cart
      });
    }

    // check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => String(item.sparePartId) === String(productId)
    );

    if (existingItemIndex >= 0) {
      // update quantity of existing item
      const newQuantity = cart.items[existingItemIndex].quantity + Number(quantity);
      
      // check stock for new total quantity
      if (product.stockQuantity != null && product.stockQuantity < newQuantity) {
        return res.status(400).json({ message: 'Adding this quantity would exceed available stock' });
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // add new item to cart
      const itemSnapshot = {
        sparePartId: product._id,
        storeId: product.storeId,
        name: product.name || product.partNumber,
        brand: product.brand,
        sku: product.partNumber,
        price: Number(product.price || 0),
        quantity: Number(quantity)
      };
      
      cart.items.push(itemSnapshot);
    }

    // recalculate total amount
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.save();
    
    res.status(200).json({ 
      message: 'Product added to cart successfully', 
      cart: cart 
    });
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ 
      message: 'Error adding product to cart', 
      error: error.message 
    });
  }
};

// get user's cart
export const getCart = async (req, res) => {
  try {
    let userId = null;
    if (req.user && req.user._id) userId = req.user._id;
    else if (req.params.userId) userId = req.params.userId;
    else if (req.cookies?.user) {
      try { userId = JSON.parse(req.cookies.user)._id; } catch (e) {}
    }
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const cart = await Order.findOne({ userId, status: "cart" }).populate('items.sparePartId');
    
    if (!cart) {
      return res.status(200).json({ 
        cart: { userId, items: [], totalAmount: 0 } 
      });
    }

    res.status(200).json({ cart });
    
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ 
      message: 'Error fetching cart', 
      error: error.message 
    });
  }
};

// remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({ message: 'User ID and Product ID are required' });
    }

    const cart = await Order.findOne({ userId, status: "cart" });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // remove item from cart
    cart.items = cart.items.filter(item => String(item.sparePartId) !== String(productId));
    
    // recalculate total
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.save();
    
    res.status(200).json({ 
      message: 'Item removed from cart', 
      cart 
    });
    
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ 
      message: 'Error removing item from cart', 
      error: error.message 
    });
  }
};

// convert cart to order (checkout)
export const checkout = async (req, res) => {
  try {
    const { shippingAddress, paymentInfo } = req.body;
    
    let userId = null;
    if (req.user && req.user._id) userId = req.user._id;
    else if (req.body.userId) userId = req.body.userId;
    else if (req.cookies?.user) {
      try { userId = JSON.parse(req.cookies.user)._id; } catch (e) {}
    }
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // find cart
    const cart = await Order.findOne({ userId, status: "cart" });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // validate stock for all items before checkout
    for (const item of cart.items) {
      const product = await SparePart.findById(item.sparePartId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stockQuantity != null && product.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }
    }

    // convert cart to order
    cart.status = "pending";
    cart.orderDate = new Date();
    if (shippingAddress) cart.shippingAddress = shippingAddress;
    if (paymentInfo) cart.metadata.paymentInfo = paymentInfo;

    await cart.save();

    // update stock quantities
    for (const item of cart.items) {
      await SparePart.findByIdAndUpdate(
        item.sparePartId,
        { $inc: { stockQuantity: -item.quantity } }
      );
    }

    res.status(200).json({ 
      message: 'Order placed successfully', 
      order: cart 
    });
    
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ 
      message: 'Error during checkout', 
      error: error.message 
    });
  }
};