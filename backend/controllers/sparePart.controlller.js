import SparePart from "../models/sparePart.model.js";


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