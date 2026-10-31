const jwt           = require('jsonwebtoken');

const jwtPrivate    = process.env.JWT_TOKEN; 

module.exports = function(req, res, next) {
    try {

        if(!req.user.isAdmin) {
            return res.status(403).json({
                status: false,
                msg: 'NOT Authorized for Accessing This Route'
            }).end();
        }

        next();
    } catch(e) {
        return res.status(403).json({
            status: false,
            msg:    'NOT Authorized To Access This Route'
        }).end();
    }
}