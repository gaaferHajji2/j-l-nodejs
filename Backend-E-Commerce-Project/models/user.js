const mongoose  = require('mongoose');

const jwt       = require('jsonwebtoken');
const jwtKey    = process.env.JWT_TOKEN;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
    },

    passwordHash: {
        type: String,
        required: true,
    },

    phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 25,
        // unique: true,
    },

    street: {
        type: String,
        default: "SYR",
    },

    apartment: {
        type: String,
        default: "SYR",
        // required: true,
    },

    city: {
        type: String,
        default: "SYR",
        // required: true,
    },

    zip: {
        type: String,
        default: '0000-0000',
    },

    country: {
        type: String,
        default: 'SY',
    },

    isAdmin: {
        type: Boolean,
        default: false,
    },
});

userSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

userSchema.methods.generateAuthToken= function() {
    let token = jwt.sign({ 
        id: this._id, isAdmin: this.isAdmin 
    }, jwtKey, { expiresIn: '1w' }) // also we have 1d.

    return token;
}

const User = mongoose.model('User', userSchema);

module.exports = User;