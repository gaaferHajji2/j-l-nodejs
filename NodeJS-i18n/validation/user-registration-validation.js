const { body } =require('express-validator')

// User Registration Validation
const userRegistrationValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('validation.required')
    .isLength({ min: 3, max: 20 })
    .withMessage('validation.minLength')
    .custom((value) => {
      // Simulate database check
      const takenUsernames = ['admin', 'user', 'test'];
      if (takenUsernames.includes(value.toLowerCase())) {
        throw new Error('validation.custom.usernameTaken');
      }
      return true;
    }),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('validation.required')
    .isEmail()
    .withMessage('validation.email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('validation.required')
    .isLength({ min: 8 })
    // .withMessage({key: 'validation.minLength', args: { min: 3 }})
    .withMessage('validation.minLength')
    .custom((value) => {
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        throw new Error('validation.custom.weakPassword');
      }
      return true;
    }),
  
  body('confirmPassword')
    .notEmpty()
    .withMessage('validation.required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('validation.passwordMatch');
      }
      return true;
    }),
  
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('validation.numeric'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('validation.url'),
  
  body('role')
    .optional()
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('validation.oneOf')
];

module.exports = userRegistrationValidation