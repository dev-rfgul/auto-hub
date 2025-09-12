import Order from '../models/order.model.js';


//get order by id
export const getOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// get order by user id
export const getOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ userId });
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders by user ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//get order by store id
export const getOrdersByStoreId = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    // Orders may reference the store on each item (items.storeId)
    // or (less commonly) on a top-level `storeId` field. Query both.
    const orders = await Order.find({
      $or: [{ 'items.storeId': storeId }, { storeId }],
    }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders by store ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = status || order.status;
    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};