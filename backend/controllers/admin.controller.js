import Admin from '../models/admin.model.js';
import Dealer from '../models/dealer.model.js';


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
}
