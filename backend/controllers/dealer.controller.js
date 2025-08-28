import Dealer from '../models/dealer.model.js';

export const registerDealer = async (req, res) => {
  const { name, cnic, phone, address } = req.body;
  console.log(req.body)
  const dealer = new Dealer({ name, cnic, phone, address });
  await dealer.save();
  res.status(201).json(dealer);
};
