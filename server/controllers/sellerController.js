import jwt from 'jsonwebtoken';

//Seller Login
export const sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
    
        if (password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
            res.cookie('sellerToken', token, {
                httpOnly: true, // secure: can't be accessed by JS
                secure: false,
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiration time
            })
    
            return res.json({ success: true, message: "Seller Logged in Successfully" });
    
        }
        else {
            return res.json({ success: false, message: "Seller Email and password does not match" });
        }
    } catch (error) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while logging Seller "+ e.message});
    }

}


export const isSellerAuth = async(req, res) => {
    try {
        return res.json({
            success: true
        })
    }
    catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while authenticating seller "+ e.message});
    }
}

export const sellerlogout = async (req, res) => {
    try {
        res.clearCookie('sellerToken', {
                httpOnly: true, // secure: can't be accessed by JS
                secure: false,   // match login
                sameSite: 'lax', // match login
            })
        return res.json({
            success: true, message:"Seller Logged out"
        })
    }
    catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while logout seller"+ e.message});
    }
}