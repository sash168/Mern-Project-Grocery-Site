import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';  

//Register User API : api/user/register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({success : false, message : 'Missing Details'})
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({success : false, message : 'User Email already present'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ name, email, password : hashedPassword });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.cookie('token', token, {
            httpOnly: true, //prevent js to access the cookie
            secure: process.env.NODE_ENV === 'production', //use secure cookie in prod
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //
            maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiration time
        })

        return res.json({ success: true, user: {email: user.email, name: user.name}})
    }
    catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while creating user "+ e.message});
    }
}


//Login User

export const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ success: false, message: 'Email and Password is required' }); 
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User Email not present' });
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({success : false, message : 'Password doesnt match'})
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.cookie('token', token, {
            httpOnly: true, //prevent js to access the cookie
            secure: process.env.NODE_ENV === 'production', //use secure cookie in prod
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //
            maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiration time
        })

        return res.json({ success: true, user: {email: user.email, name: user.name}})
        
    }
    catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while logging user "+ e.message});
    }
}

//Check Auth
export const isAuth = async(req, res) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId).select("-password");

        if (!user) { 
            return res.json({
                success: false,
                message: 'No authorized user found'
            });
        }
        return res.json({
            success: true,
            user
        })
    }
    catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while authenticating user "+ e.message});
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({
            success: true, message:"Logged out"
        })
    }
    catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while logout"+ e.message});
    }
}
    
