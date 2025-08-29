import Store from "../models/store.model.js";

export const registerStore=async(req,res)=>{
    const {name,description,address,contactInfo,operatingHours,dealerId}=req.body;
    console.log(req.body)

    try {
        const store = new Store({
            name,
            dealerId,
            description,
            address,
            contactInfo,
            operatingHours
        });

        await store.save();
        res.status(201).json({message:"Store registered successfully",store});
    } catch (error) {
        console.error("Error registering store:", error);
        res.status(500).json({message:"Internal server error"});
    }
}
