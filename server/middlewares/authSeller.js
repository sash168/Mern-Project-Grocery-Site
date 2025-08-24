import jwt from 'jsonwebtoken';

const authSeller = async (req, res, next) =>{
    const { sellerToken } = req.cookies;
    if (!sellerToken) {
            return res.json({
                success: false,
                message: 'Token not found in middleware authSeller'
            });
        }
    
        try {
            const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET)

            if (tokenDecode.email === process.env.SELLER_EMAIL) {
                next();
            } else {
                return res.json({
                    success: false,
                    message: 'Seller email does not match during authentication'
                });
            }

        }
        catch (e) {
            return res.json({
                success: false,
                message: 'Error in authSeller '+ e.message
            });
        }
}

export default authSeller;