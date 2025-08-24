import Address from "../models/Address.js";

export const addAddress = async (req, res) => {
    try {
        const { userId } = req;
        const { address } = req.body;
        await Address.create({ ...address, userId })
        res.json({ success: true, message: "Address added successfully" });

    } catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while adding address "+ e.message});
    }
}

//show all address
export const getAddress = async (req, res) => {
    try {
        const { userId } = req;
        const addresses = await Address.find({ userId })
        res.json({ success: true, addresses })
    } catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while getting address "+ e.message});
    }
}