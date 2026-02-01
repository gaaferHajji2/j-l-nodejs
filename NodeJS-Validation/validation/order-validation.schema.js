const { body } = require('express-validator')

const orderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.productId')
    .isUUID()
    .withMessage('Each item must have a valid product UUID'),
  
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('shippingAddress.zipCode')
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Invalid ZIP code format'),
  
  body('couponCode')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('Invalid coupon code format')
];

module.exports = { orderValidation }