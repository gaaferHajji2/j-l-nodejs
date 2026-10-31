const mongoose = require('mongoose');

// The Products

const orderSchema = new mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true,
    }],

    shippingAddress1: {
        type: String,
        default: 'SYR - Address 1',
        required: true,
    },

    shippingAddress2: {
        type: String,
        default: 'SYR - Address 1',
    },

    city: {
        type: String, 
        required: true,
    },

    zip: {
        type: String,
        default: '0000-0000',
    },

    country: {
        type: String,
        default: 'SYR',
    },

    phone: {
        type: String,
        default: '09930',
        minlength: 5,
        maxlength: 25,
    },

    status: {
        type: String,
        default: 'pending',
    },

    totalPrice: {
        type: Number,
        default: 1,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },

    dateOrdered: {
        type: Date,
        default: Date.now,
    }
});

const OrderModel = mongoose.model('Order', orderSchema);


orderSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true,
});

exports.Order = OrderModel;
exports.orderSchema = orderSchema;