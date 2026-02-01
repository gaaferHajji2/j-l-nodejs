const { body } = require('express-validator')

const sanitizeExample = [
  body('username').trim().escape(), // Remove whitespace and escape HTML
  body('bio').trim().escape(),
  body('tags')
    .optional()
    .customSanitizer(value => {
      // Ensure tags is always an array
      return Array.isArray(value) ? value : [value];
    })
];

module.exports = { sanitizeExample }