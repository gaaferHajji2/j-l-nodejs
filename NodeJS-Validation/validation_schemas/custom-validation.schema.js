const { body } = require('express-validator')

const customValidation = [
  body('website')
    .optional()
    .custom((value) => {
      try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        throw new Error('Must be a valid URL with http:// or https://');
      }
    }),
  
  body('birthdate')
    .optional()
    .isDate()
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        throw new Error('Must be at least 18 years old');
      }
      return true;
    }),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

module.exports = { customValidation }