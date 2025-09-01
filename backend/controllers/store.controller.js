import Store from "../models/store.model.js";
import User from "../models/user.model.js";

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
