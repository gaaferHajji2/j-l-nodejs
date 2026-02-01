const router = require('express').Router()
const { userRegistrationValidation } = require('../validation/user-registration-validation.schema')
const { handleValidationErrors } = require('../middleware/handle-validation-errors.middleware')
const { sanitizeExample } = require('../validation/sanitize-example.schema')

router.post(
  '/api/users/register', 
  userRegistrationValidation, 
  handleValidationErrors, 
  async (req, res) => {
  const { email, username, password } = req.body

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { email, username }
  });
})

router.post('/api/profile', sanitizeExample, handleValidationErrors, (req, res) => {
  // All inputs are now sanitized
  res.json({ sanitized: req.body });
});

router.post('/api/async-validation', asyncValidation, handleValidationErrors, (req, res) => {
  res.json({ message: 'Validation passed including async checks' });
});

module.exports = router