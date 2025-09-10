import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    sparePartId: { type: mongoose.Schema.Types.ObjectId, ref: "SparePart", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true }, // per-item store
    name: { type: String },      // snapshot
    brand: { type: String },     // snapshot
    sku: { type: String },       // snapshot
    price: { type: Number, required: true }, // snapshot price at time of order
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["cart","pending", "processed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: Date,
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    metadata: { type: Object, default: {} } // paymentId, tracking, etc.
  },
  { timestamps: true }
);

// avoid model overwrite in watch/dev mode
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export default Order;