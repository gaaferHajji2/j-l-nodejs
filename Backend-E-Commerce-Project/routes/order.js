const express = require("express");
const router  = express.Router();
const mongoose = require('mongoose');

// The Middlewares.
const objectId = require('../middleware/objectId');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// The Models
const { Order } = require("../models/order");
const { OrderItem } = require("../models/orderItems");

router.get('/', [auth, isAdmin], async (req, res) => {
    const orders = await Order
        .find()
        .sort('totalPrice')
        .populate('orderItems',)
        .populate('user', '-passwordHash')
        //.populate('orderItems.product');

    if(!orders || orders.length == 0) {
        return res.status(404).json({
            status: false,
            msg: 'No Data Found For The Orders',
            data_1: orders,
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: 'Successfully Getting All Orders',
        data: orders,
    }).end();
});

router.get('/:id', [objectId, auth, isAdmin], async (req, res) => {
    // Order.findById(req.params.id); 
    // Also we can use this: Order.findById();


    let order = await Order
        .findOne({ _id: req.params.id })
        .populate('user', '-passwordHash')
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category',
            }
        })
        // .populate({
        //     path: 'orderItems',
        //     populate: 'product',
        // });

    if(!order) {
        return res.status(404).json({
            status: false,
            msg: 'NO Data Found For Your Id'
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: 'Successfully Getting Order',
        'data' : order,
    }).end();
});

router.post('/', auth, async (req, res) => {
    
    let orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product,
        });

        await newOrderItem.save();

        return newOrderItem._id;
    }));

    orderItemsIds = await orderItemsIds;

    // console.log(orderItemsIds);

    let totalPrices = await Promise.all(orderItemsIds.map(async orderItemId => {
        let orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');

        let totalPrice = orderItem.product.price * orderItem.quantity;

        return totalPrice;
    }));

    // console.log(totalPrices);

    totalPrices = totalPrices.reduce((a, b) => a+b, 0);    
    
    const order = new Order({
        orderItems: orderItemsIds,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrices,
        user: req.user.id,
    });

    await order.save();

    if(!order) {
        return res.status(500).json({
            status: false,
            msg: "The Order Can't be saved",
            data_1: order,
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: 'Successfully Saving Order',
        order: order,
    }).end();
});

router.put('/:id', [objectId, auth, isAdmin], async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },

        { new: true }
    );


    if(!order) {
        return res.status(404).json({
            status: false,
            msg: 'No Data Found, OR Server Error',
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: 'Successfully Updating Order Status',
        'data-1': order,
    }).end();
});

router.delete('/:id', [objectId, auth, isAdmin], async (req, res) => {
    const order = await Order.findByIdAndRemove(req.params.id);

    if(!order) {
        return res.status(404).json({
            status: false,
            msg: 'No Data Available, OR Server Error',
        }).end();
    }

    let result = Promise.all(order.orderItems.map( async orderItem => {
        await OrderItem.findByIdAndRemove(orderItem._id);
    }));

    await result;

    return res.status(200).json({
        status: false,
        msg: 'Successfully Deleting Order',
        'data-1': order,
    }).end();
});

router.delete('/delete/all/orders', [auth, isAdmin], async (req, res) => {
    const orderItems = await OrderItem.deleteMany({});
    const orders = await Order.deleteMany({});

    return res.status(200).json({
        status: true,
        msg: 'Successfully Deleing All Orders',
        'data-1' : orderItems,
        'data-2': orders,
    }).end();
});

router.get('/get/total/sales', [auth, isAdmin], async (req, res) => {
    const totalSales = await Order.aggregate([
        { 
            $group: { 
                // _id: "111", 
                // Note: If we remove _id it will raise an Error.
                _id: new mongoose.Types.ObjectId(),
                totalsales: { $sum: '$totalPrice' }
            }
        }
    ]);

    if(!totalSales) {
        return res.status(500).json({
            status: false,
            msg: "Server Error During Aggregating",
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: 'Successfully Getting All Sales',
        'data-1': totalSales,
        'data-2': totalSales[0].totalsales,
    }).end();
});

router.get('/get/count/orders', [auth, isAdmin], async (req, res) => {
    const orderCount = await Order.estimatedDocumentCount();

    if(!orderCount) {
        return res.status(500).json({
            status: false,
            'msg': 'Error During Count Of Orders',
        }).end();
    }

    return res.status(200).json({
        'status': true,
        msg: 'Successfully Getting Total Count of Orders',
        'data-1': orderCount,
    }).end();
});

router.get('/get/user/orders/:id', [objectId, auth], async (req, res) => {

    // NOTE: When we get order for specific user, 
    // we must check if the order belong to him.

    // HERE we implement get order by id for admin only.

    const userOrders = await Order
        .find( { user: req.params.id } )
        .populate('user', '-passwordHash')
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category',
            }
        })

    if(!userOrders || userOrders.length == 0) {
        return res.status(200).json({
            status: false,
            msg: 'No Orders For This User Yet.',
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: 'Successfully Getting User Orders',
        'data-1': userOrders,
    }).end();
});

module.exports = router;