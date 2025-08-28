import Dealer from '../models/dealer.model.js';

export const registerDealer = async (req, res) => {
  const { businessName, taxId, phone, address } = req.body;
  const dealer = new Dealer({ businessName, taxId, phone, address });
  await dealer.save();
  res.status(201).json(dealer);
};
