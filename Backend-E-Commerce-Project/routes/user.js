const express   = require("express");
const router    = express.Router();
const bcrypt    = require('bcrypt');
const jwt       = require('jsonwebtoken');
const _         = require('lodash');

// The Models Section.
const User      = require('../models/user');

// The Middleware section.
const objectId  = require('../middleware/objectId');
const auth      = require('../middleware/auth');
const isAdmin   = require('../middleware/isAdmin');

// The ENV variables.
// const jwtPrivate = process.env.JWT_TOKEN;

router.get('/', [auth, isAdmin], async(req, res) => {
    const users = await User.find({}).sort('-isAdmin').select('-passwordHash');

    if(!users || users.length == 0){
        return res.status(404).json({
            status: false,
            msg: 'No Users Until Now',
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: 'Successfully Getting All User Data',
        data: users,
    }).end();
});

router.get('/:id', [objectId, auth, isAdmin], async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user) {
        return res.status(404).json({
            status: false,
            msg: 'No User Found',
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: 'Successfully Getting User Data',
        data: user
    }).end();
});

router.get('/get/me', auth, async (req, res) => {
    let user = req.user;

    user = await User.findById(user.id).select('-password');

    if(!user) {
        // HERE it may be hacker.
        return res.status(400).json({
            status: false,
            msg: 'No Route Found',
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: 'Successfully Getting Your Profile',
        data: user,
    }).end();
});

router.post('/', async(req, res) => {
    // First check for email Address.
    let user = await User.findOne( { email: req.body.email });

    if(user) {
        return res.status(400).json({
            status: false,
            msg: 'This Email Has Been Taken Please Change It',
        }).end();
    }

    user = new User(req.body);

    let salt = await bcrypt.genSalt(10);
    console.log("Salt is: ", salt);
    user.passwordHash = await bcrypt.hash(user.passwordHash, salt);

    await user.save();

    if(!user) {
        return res.status(500).json({
            status: false,
            msg: 'Sorry Error in Creating User',
        }).end();
    }

    const token = user.generateAuthToken();

    return res.status(200).header('x-auth-token', token).json({
        status: true,
        msg: "Successfully Creating Account",
        data: _.pick(user, ['name', 'email', 'phone', 'isAdmin']),
    });
});

router.post('/auth/login', async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    // if we use find it wil return an array of values.

    if(!user){
        return res.status(400).json({
            status: false,
            msg: 'Invalid Email Or Password 1'
        }).end();
    }

    // console.log(req.body.password);
    // console.log(user.passwordHash);
    // console.log(user);

    let result = await bcrypt.compare(req.body.password, user.passwordHash);

    if(!result) {
        return res.status(400).json({
            status: false,
            msg: 'Invalid Email Or Password 2',
        }).end();
    }

    let token = user.generateAuthToken();

    return res
        .status(200)
        .header('x-auth-token', token)
        .json({
            'status': true,
            'msg': 'User Logged In Successfully',
            user: _.pick(user, ['email', 'phone', 'isAdmin', 'name', 'id', '_id']),
    }).end();
});

router.get('/get/all-count', [auth, isAdmin], async (req, res) => {
    let count = await User.countDocuments();

    return res.status(200).json({
        status: true,
        userCount: count,
    }).end();
});

router.delete('/:id', [objectId, auth, isAdmin], async (req, res)=> {
    if(req.params.id === req.user.id) {
        return res.status(400).json({
            status: false,
            msg: 'Sorry Can\'t Delete Your Self',
        }).end();
    }

    const user = await User
        .findByIdAndRemove(req.params.id)
        .select('-passwordHash');

    if(!user) {
        return res.status(400).json({
            status: false,
            msg: 'No User Found',
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: 'User Deleted Successfully',
        data: user,
    }).end();
});

module.exports = router;