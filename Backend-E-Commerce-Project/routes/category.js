const express   = require("express");
const router    = express.Router();

// models
const Category  = require("../models/category");

// middlewares
const objectId  = require('../middleware/objectId');
const auth      = require('../middleware/auth');
const isAdmin   = require('../middleware/isAdmin');

const api = process.env.API_URL;

router.get('/', async (req, res) => {
    const categories = await Category.find({}).sort('name');

    if(!categories || categories.length == 0) {
        return res.status(404).json({ status: false, msg: 'No Data Found'}).end();
    }

    return res.status(200).json({ 
        status: true, 
        msg: 'All Data Ok', 
        data: categories 
    }).end();
});

router.post('/', [auth, isAdmin], async(req, res) =>{
    if(!req.body.name || req.body.name.length < 3 || req.body.name.length > 50) {
        return res.status(400).json({ 
            status: false, 
            msg: 'Please Check your data for name'
        }).end();
    }

    const category = new Category({ 
        name: req.body.name, 
        color: req.body.color, 
        icon: req.body.icon 
    });

    await category.save();

    if(!category) {
        return res.status(500).json({
            status: false,
            msg: 'Sorry Error Happened',
        });
    }

    return  res.status(200).json({
        status: true,
        msg: "Data Created Successfully",
        data: category,
    }).end();
});

router.get("/:id", objectId, async(req, res) => {
    const category = await Category.findById(req.params.id);

    if(!category) {
        return res.status(404).send({
            status: false,
            msg: 'No Data Found For This Id of Category',
        }).end();
    }

    return res.status(200).json({ 
        status: true, 
        msg: 'Data Found For Category', 
        data: category
    }).end();
});

router.delete('/delete-all', [auth, isAdmin], async(req, res) =>{
    await Category.deleteMany({});

    return res.status(200).json({
        status: true,
        msg: 'All Categories Deleted'
    }).end();
});

router.delete('/:id', [objectId, auth, isAdmin], async (req, res) => {
    const category = await Category.findByIdAndRemove(req.params.id);

    if(!category){
        return res.status(404).json({ 
            status: false,
            msg: 'No Data Found For This id on Category'
         }).end();
    }

    return res.status(200).json({
        status: true,
        msg: 'Category Deleted Successfully',
        data: category,
    }).end();
});

// UPDATE THE Category By ID.
router.put("/:id", [objectId, auth, isAdmin], async (req, res) => {
    const category = await Category.findById(req.params.id);

    if(req.body.name){
        category.name = req.body.name;
    }

    if(req.body.color) {
        category.color = req.body.color;
    }

    if(req.body.icon) {
        category.icon = req.body.icon;
    }

    await category.save();

    return res.status(200).json({
        status: true,
        msg: "Category Updated Successfully",
        data: category,
    })
});


module.exports = router;