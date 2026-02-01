const router = require('express').Router();
const { userRegistrationValidation } = require('../validation/user-registration-validation.schema')
const { handleValidationErrors } = require('../middleware/handle-validation-errors.middleware');

router.post(
  '/api/users/register', 
  userRegistrationValidation, 
  handleValidationErrors, 
  async (req, res) => {
  const { email, username, password } = req.body;

  // Your registration logic here...
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { email, username }
  });
})


module.exports = router