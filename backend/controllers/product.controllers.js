import SparePart from "../models/sparePart.model.js";

export const addSparePart = async (req, res) => {
  try {
  // log incoming payload for debugging
  console.log('addSparePart - req.body:', req.body);
  console.log('addSparePart - req.files:', req.files);
  const newSparePart = new SparePart(req.body);
    await newSparePart.save();
    res.status(201).json(newSparePart);
  } catch (error) {
    res.status(500).json({ message: "Error adding spare part", error });
  }
};
