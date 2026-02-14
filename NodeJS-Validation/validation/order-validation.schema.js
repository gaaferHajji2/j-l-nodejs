const { body, param, query } = require('express-validator')

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

const orderUserValidation = [
    param('userId').isUUID().withMessage('Invalid user ID'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort must be asc or desc')
]

module.exports = { orderValidation, orderUserValidation }