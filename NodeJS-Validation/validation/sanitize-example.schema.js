const { body } = require('express-validator')

const sanitizeExample = [
  body('username').trim().escape(), // Remove whitespace and escape HTML
  body('bio').trim().escape(),
  body('tags')
    .optional()
    .isArray()
    .withMessage("Tags must be array")
    .customSanitizer(value => {
      // Ensure tags is always an array
      return Array.isArray(value) ? value : [value];
    }),
    body('tags.*').isString().withMessage("Tag must be string"),
];

module.exports = { sanitizeExample }