const router = require('express').Router()
const { orderValidation } = require('../validation/order-validation.schema')
const { handleValidationErrors } = require('../middleware/handle-validation-errors.middleware')

router.post('/api/orders', orderValidation, handleValidationErrors, async (req, res) => {
  res.json({
    success: true,
    message: 'Order created',
    order: req.body
  });
});