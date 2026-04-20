const router = require('express').Router()

// Registration route
router.post('/api/register', 
  (req, res) => {
    res.json({
      success: true,
      message: req.__('Registration successful'),
      data: {
        username: req.body.username,
        email: req.body.email
      }
    });
  }
);

module.exports = router