const jwt           = require('jsonwebtoken');

const jwtPrivate    = process.env.JWT_TOKEN; 


module.exports = function(req, res, next) {
    try {
        let token   = req.header('x-auth-token');

        // console.log("Token from auth.js middleware is: ", token);

        if(!token) {
            return res.status(401).json({
                status: false,
                msg: 'No Token Provided First Create Account OR Logged In'
            }).end();
        }

        let user    = jwt.verify(token, jwtPrivate);

        req.user = user;

        next();

    } catch(e) {
        console.error("Error Message from Auth Middleware is: ", e.message);
        console.error(e);

        return res.status(400).json({
            status: false,
            msg: 'NO Token OK',
            msg: e.message,
        }).end();
    }
}