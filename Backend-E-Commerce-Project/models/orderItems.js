const mongoose = require('mongoose');

// The Models And Schemas
const { productSchema } = require('../models/product');

const orderItemShema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },

    quantity: {
        type: Number,
        required: true,
    }
});

const OrderItem = mongoose.model('OrderItem', orderItemShema);

orderItemShema.virtual('id').get(function() {
    return this._id.toHexString();
});

orderItemShema.set('toJSON', {
    virtuals: true,
})


module.exports.OrderItem = OrderItem;
module.exports.orderItemShema = orderItemShema;