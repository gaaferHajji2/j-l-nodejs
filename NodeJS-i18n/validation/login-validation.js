const { body } =require('express-validator')

// Login Validation
const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('validation.required')
    .isEmail()
    .withMessage('validation.email'),
  
  body('password')
    .notEmpty()
    .withMessage('validation.required')
];

module.exports = loginValidation