const router = require('express').Router()
const { conditionalValidation } = require('../validation/conditional-validation.schema')
const { handleValidationErrors } = require('../middleware/handle-validation-errors.middleware')

router.post('/api/accounts', conditionalValidation, handleValidationErrors, (req, res) => {
  res.json({ account: req.body });
});

module.exports = router
