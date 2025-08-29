import Store from "../models/store.model";

export const registerStore=async(req,res)=>{
    const {name,description,address,contactInfo,operatingHours}=req.body;

    try {
        const store = new Store({
            name,
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
