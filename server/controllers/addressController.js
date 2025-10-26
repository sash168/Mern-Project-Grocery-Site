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

export const deleteAddress = async (req, res) => {
  const { id } = req.params; // address ID

  try {
    const address = await Address.findById(id);

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // Use req.userId from middleware
    if (address.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Address.findByIdAndDelete(id);

    res.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
