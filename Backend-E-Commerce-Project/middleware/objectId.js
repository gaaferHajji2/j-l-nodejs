const mongoose = require('mongoose');

module.exports = function(req, res, next) {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({
            status: false,
            msg: 'Please check id data',
        }).end();
    }

    next();
}