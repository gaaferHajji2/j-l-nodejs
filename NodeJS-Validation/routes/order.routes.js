const router = require('express').Router()
const { orderValidation, orderUserValidation } = require('../validation/order-validation.schema')
const { handleValidationErrors } = require('../middleware/handle-validation-errors.middleware')

router.post('/api/orders', orderValidation, handleValidationErrors, async (req, res) => {
  res.json({
    success: true,
    message: 'Order created',
    order: req.body
  });
});

router.get('/api/users/:userId/orders', 
  orderUserValidation, handleValidationErrors, 
  async (req, res) => {
    res.json({
      userId: req.params.userId,
      query: req.query
    });
})

module.exports = router;