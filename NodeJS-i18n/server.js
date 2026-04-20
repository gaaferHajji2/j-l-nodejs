const express = require('express')
const i18n = require('i18n')
const { body, validationResult } = require('express-validator')
const path = require('path')

const app = express()
// Configure i18n
i18n.configure({
  locales: ['en', 'es', 'fr'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  queryParameter: 'lang',
  autoReload: true,
  updateFiles: false,
  objectNotation: true,
  register: global
});

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(i18n.init)

// Custom validation message formatter using i18n
const createValidationMiddleware = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Translate error messages
      const translatedErrors = errors.array().map(error => ({
        ...error,
        msg: req.__(error.msg) // Translate the message key
      }));
      
      return res.status(400).json({
        success: false,
        errors: translatedErrors
      });
    }
    next();
  };
};
