const router = require('express').Router()

// Login route
router.post('/api/login',
  createValidationMiddleware(loginValidation),
  (req, res) => {
    res.json({
      success: true,
      message: req.__('Login successful'),
      token: 'jwt-token-here'
    });
  }
);

module.exports = router;