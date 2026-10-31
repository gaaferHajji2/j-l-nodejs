const express   = require('express');
const router    = express.Router();
const mongoose  = require("mongoose");
const multer    = require('multer');
const fs        = require('fs');

// models
const {Product} = require("../models/product");
const Category = require("../models/category");


// middlewares
const objectId  = require('../middleware/objectId');
const auth      = require('../middleware/auth');
const isAdmin   = require('../middleware/isAdmin');

// The Accepted File Extensions in our App.
const FILE_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpg' : 'jpg',
    'image/jpeg': 'jpeg'
};

// configure the disk storage for naming of images.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // if we set here /dest/uploads it will take the relative path
        // of device (server or computer).
        let isValid  = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid Image Type');

        if(isValid) {
            uploadError = null;
        }

        cb(uploadError, 'dest/uploads')
    },
    
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');

        // another way
        const extension = FILE_TYPE_MAP[file.mimetype];

        cb(
            null, 
            // fileName+ '-' + Date.now() + '.' + extension,
            `${fileName}-${Date.now()}.${extension}`
        );
    }
})
  
const uploadOptions = multer({ storage: storage })
  

router.get('/', async (req, res) =>{
    // const product = {
    //     id: 1,
    //     name: "Product Name Here",
    //     image: "The Image URL here",
    // };

    // NOTE Very Important: change from array to object
    // so no force to select all products, else it will return
    // empty array

    // let filter = [];
    let filter = {};

    if(req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }

    // FOR FUTURE WORK: change this to accept $in-operator.
    // AND See The Result.
    const products = await Product
        .find(filter)
        .sort('name -numberInStock')
        .populate('category');

    if(!products || products.length == 0) {
        return res.status(404).json({ 
            status: false,
            msg: 'No data Found For Products.'
        }).end();
    }

    return res.json({
        status: true,
        msg: "All Product Getted Successfully",
        data: products,
    }).end();
});

router.get('/get-all-count-of-products', [auth, isAdmin], async(req, res) => {
    let count = await Product.estimatedDocumentCount();
    let count2 = await Product.countDocuments();

    if(count == 0 || count2 == 0) {
        return res.status(400).json({
            status: false,
            msg: 'No Products Available Now, Try First Adds One.'
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: "Getting All Documents Count Successfully",
        count1: count,
        count2: count2,
    }).end();
});

// NOTE: When we pass 0 it means no limit.
router.get('/get/featured-products/:count?', async(req, res) => {

    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find( { isFeatured: true }).limit(count);

    if(!products || products.length == 0) {
        return res.status(400).json({
            status: false,
            msg: 'No Data Found For isFeatured For Products'
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: 'Successfully Getting Featured Products',
        data: products,
    }).end();
});


router.get('/:id', [objectId, auth], async(req, res) => {
    try{
        const product = await Product
            .findById(req.params.id)
            .populate('category');

        if(!product) {
            return res.status(404).json({
                status: false,
                msg: 'No Data Found For This ID for Product.'
            }).end();
        }
        
        return res.status(200).json({
            status: true,
            product: product,
        }).end();
    }catch (ex) {
        console.log("error is: ", ex);
        console.log(typeof ex);
        return res.status(500).json({
            status: false,
            msg: "Errror Occurred, In DB",
        }).end();
    }
});

router.post('/', [auth, isAdmin, uploadOptions.single('image')], async (req, res) => {

    if(!mongoose.Types.ObjectId.isValid(req.body.category)){
        return res.status(400).json({
            status: false,
            msg: "Please Check Your Data For CategoryId"
        }).end();
    }

    const category = await Category.findById(req.body.category);

    if(!category) {
        return res.status(404).json({
            status: false,
            msg: 'No Data Found For This Id of category.',
        }).end();
    }

    const file = req.file;

    if(!file) {
        return res.status(404).json({
            status: false,
            msg: 'Please Upload One Image to Product.',
        }).end();
    }


    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/dest/uploads/`;

    const product = new Product({
        name: req.body.name,
        image: `${basePath}${fileName}`,
        numberInStock: req.body.numberInStock,
        description: req.body.description,
        richDescription: req.body.richDescription,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        dateCreated: req.body.dateCreated,
    });

    // Fill The Data.
    // product.name = req.body.name;
    // product.image = req.body.image;
    // product.numberInStock = req.body.numberInStock;

    try{
        await product.save();

    }catch(ex) {
        console.log("Error is: ", ex);
        return res.status(500).json({
            status: false,
            msg: "An error Occurred, Please Try Again Later."
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: "Product Created Successfully",
        data: product,
    }).end();
});


// This must be at first.
router.delete('/delete-all', [auth, isAdmin], async (req, res) => {
    const result = await Product.deleteMany({});

    if(!result) {
        console.log(result);
        return res.status(400).json({
            status: false,
            msg: 'No Data Found To Delete From Products'
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: "All Products Deleted Successfully."
    }).end();
});


router.delete("/:id", [objectId, auth, isAdmin], async (req, res) => {
    const product = await Product.findByIdAndRemove(req.params.id);

    if(!product) {
        return res.status(400).json({
            status:  false,
            msg: "No Data Found For This product Id.",
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: "Successfully Deleting Product",
        data: product,
    }).end();
});

router.put('/:id', [objectId, auth, isAdmin], async (req, res) => {
    let product = await Product.findById(req.params.id);
    /**
     * name: req.body.name,
        image: req.body.image,
        numberInStock: req.body.numberInStock,
        description: req.body.description,
        richDescription: req.body.richDescription,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        dateCreated: req.body.dateCreated,
     */
    if(req.body.name) {
        product.name = req.body.name;
    }

    if(req.body.image) {
        product.image = req.body.image;
    }

    if(req.body.numberInStock) {
        product.numberInStock = req.body.numberInStock;
    }

    if(req.body.description) {
        product.description = req.body.description;
    }

    if(req.body.richDescription) {
        product.richDescription = req.body.richDescription;
    }

    if(req.body.images) {
        product.images = req.body.images;
    }

    if(req.body.brand) {
        product.brand = req.body.brand;
    }

    if(req.body.price) {
        product.price = req.body.price;
    }

    if(req.body.category) {
        if(!mongoose.isValidObjectId(req.body.category)) {
            return res.status(400).json({
                status: false,
                msg: 'No Category Found For Updating Product 1'
            }).end();
        }

        let category = await Category.findById(req.body.category);
        if(!category) {
            return res.status(400).json({
                status: false,
                msg: 'No Category Found For Updating Product 2'
            }).end();
        }
        product.category = req.body.category;
    }

    if(req.body.rating) {
        product.rating = req.body.rating;
    }

    if(req.body.numReviews) {
        product.numReviews = req.body.numReviews;
    }

    if(req.body.isFeatured) {
        product.isFeatured = req.body.isFeatured;
    }

    if(req.body.dateCreated) {
        product.dateCreated = req.body.dateCreated;
    }

    await product.save();

    if(!product) {
        return res.status(500).json({
            status: false,
            msg: 'Internal Server Error for saving updated product',
        }).end();
    }

    return res.status(200).json({
        status: true,
        msg: 'Product Updated Successfully',
        data: product,
    }).end();
});

router.put('/upload/product/gallery/:id', 
    [objectId, auth, isAdmin, uploadOptions.array('images', 3)], 
    async (req, res) => {
        const files = req.files;
        imagesPaths = [];

        if(!files) {
            return res.status(400).json({
                status: false,
                msg: "Upload Files First",
            }).end();
        }

        files.map(file => {
            console.log(file);
            imagesPaths.push(`${req.protocol}://${req.get('host')}/dest/uploads/${file.filename}`);
        });

        const product = await Product.findByIdAndUpdate(req.params.id, {
            images: imagesPaths,
        }, { new:true });

        if(!product) {
            return res.status(404).json({
                status: false,
                msg: 'Please Check Your Data And ID, OR Server Error',
            }).end();
        }

        return res.status(200).json({
            status: true,
            msg: 'Product Has Been Updated Successfully',
            data: product,
        }).end();
});

router.get('/get/image/by/name/:name', async (req, res)=>{
    const imageName = req.params.name;

    fs.readFile(`dest/uploads/${imageName}`, (err, file) => {
        if(err) {
            return res.status(404).json({
                status: false,
                msg: 'Invalid Image Name, OR Server Error',
            }).end();
        }

        // We must set the response in this order, so
        // if there is any error will be fired.
        res.setHeader('Content-Type', 'image/jpeg');
        return res.status(200).send(file).end();
    });

});

module.exports = router;