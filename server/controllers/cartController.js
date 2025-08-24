import User from '../models/User.js'

//update user cart
export const updateCart = async (req, res) => {
    try {
        const { userId } = req;
        const { cartItems } = req.body;
        
        await User.findByIdAndUpdate(userId, { cartItems })
        
        res.json({ success: true })

    } catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while updating cart "+ e.message});
    }
}