import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';  

export const register = async (req, res) => {
    try {
        const { name, phone, password } = req.body;

        if (!name || !phone || !password)
            return res.json({ success: false, message: "Missing details" });

        const existingUser = await User.findOne({ phone });
        if (existingUser)
            return res.json({ success: false, message: "Phone number already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            phone,
            password: hashedPassword,
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
            success: true,
            user: { name: user.name, phone: user.phone },
        });

    } catch (error) {
        return res.json({
            success: false,
            message: "Error creating user " + error.message,
        });
    }
};


export const login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password)
            return res.json({ success: false, message: "Phone & password required" });

        const user = await User.findOne({ phone });
        if (!user)
            return res.json({ success: false, message: "Phone number not registered - Please check number or Sign up" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.json({ success: false, message: "Incorrect password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
            success: true,
            user: { name: user.name, phone: user.phone },
        });

    } catch (error) {
        return res.json({
            success: false,
            message: "Login error: " + error.message,
        });
    }
};


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
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
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
    
