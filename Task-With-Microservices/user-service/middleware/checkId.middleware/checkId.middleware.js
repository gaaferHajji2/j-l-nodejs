import mongoose from "mongoose"

export default function (req, res, next) {
    if(mongoose.isValidObjectId(req.params.id)) {
        next()
    } else {
        return res.status(400).json({
            msg: "The id param is not valid"
        })
    }
}