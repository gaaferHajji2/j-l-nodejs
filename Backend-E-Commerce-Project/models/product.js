const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 150,
    },

    description : {
        type: String,
        required: true,
    },

    richDescription: {
        type: String,
        default: '',
    },

    image: {
        type: String,
        default: '',
    },

    images: {
        type: [ String ],
        default: ''
    },

    brand: {
        type: String,
        default: ''
    },

    price: {
        type: Number,
        required: true,
        min: 1,
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },

    numberInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 15000,
    },

    rating: {
        type: Number,
        default: 0,
    },

    numReviews: {
        type: Number,
        default: 0,
    },

    isFeatured: {
        type: Boolean,
        default: false,
    },

    dateCreated: {
        type: Date,
        default: Date.now,
    },
});

productSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
})

const ProductModel = mongoose.model('Product', productSchema);

module.exports.Product = ProductModel;
module.exports.productSchema = productSchema;