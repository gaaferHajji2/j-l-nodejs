const { body, validationResult } = require('express-validator');

// Define the validation rules
const registerValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 50 }).withMessage('Name cannot be more than 50 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please add a valid email')
        .normalizeEmail(), // Converts email to lowercase (matches Mongoose lowercase: true)

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Extract only the error messages for a cleaner response
        const errorMessages = errors.array().map(err => err.msg);
        return res.status(400).json({
            success: false,
            errors: errorMessages
        });
    }

    next();
};

export {
    registerValidationRules,
    handleValidationErrors
};