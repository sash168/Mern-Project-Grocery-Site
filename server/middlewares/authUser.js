import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({
            success: false,
            message: 'Token not found in middleware authUser'
        });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
        if (tokenDecode.id) {
            req.userId = tokenDecode.id;
        } else {
            return res.json({
                success: false,
                message: 'Token Id not found'
            });
        }
        next();
    }
    catch (e) {
        return res.json({
            success: false,
            message: 'Error in authUser '+e.message
        });
    }
}

export default authUser;