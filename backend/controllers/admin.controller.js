import Dealer from '../models/dealer.model.js';
import Store from '../models/store.model.js';


//verify dealer
export const verifyDealer = async (req, res) => {
    console.log(req.params)
  const { dealerId ,action} = req.params;
  console.log(dealerId)
  const dealer = await Dealer.findById(dealerId);
  console.log(dealer)
  if (!dealer) {
    return res.status(404).json({ message: 'Dealer not found' });
  }
  dealer.verificationStatus = action;
  await dealer.save();
  return res.status(200).json({ message: 'Dealer verified successfully' });
};
//get all dealers
export const getAllDealers=async(req,res)=>{
  try {
    const dealers = await Dealer.find();
    return res.status(200).json(dealers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
//verify store
export const verifyStore = async (req, res) => {
  const { storeId, action } = req.params;
  console.log(req.params)
  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(404).json({ message: 'Store not found' });
  }
  store.approvalStatus = action;
  await store.save();
  console.log(`Store ${storeId} ${action}d successfully`);
  return res.status(200).json({ message: 'Store verified successfully' });
};
//get all stores
export const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find();
    return res.status(200).json(stores);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
