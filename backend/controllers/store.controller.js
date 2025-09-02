import Store from "../models/store.model.js";
import User from "../models/user.model.js";
import SparePart from "../models/sparePart.model.js";

export const registerStore = async (req, res) => {
  const { name, description, address, contactInfo, operatingHours, dealerId } = req.body;
console.log(req.body);
  try {
    // 1. Create the store first
    const store = new Store({
      name,
      dealerId,
      description,
      address,
      contactInfo,
      operatingHours,
    });

    await store.save();

    // 2. Push the store id into the dealer's `dealer.stores` array
    await User.findByIdAndUpdate(
      dealerId,
      { $push: { "dealer.stores": store._id } },
      { new: true }
    );

    res.status(201).json({ message: "Store registered successfully", store });
  } catch (error) {
    console.error("Error registering store:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//get stoer by id
export const getStoreById=async (req,res)=>{
  const storeId=req.params.id;
  try {
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json(store);
  } catch (error) {
    console.error("Error fetching store:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const getProductByStore=async(req,res)=>{
  const storeId=req.params.id;
  try {
    const products = await SparePart.find({ storeId });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}