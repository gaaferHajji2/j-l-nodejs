class ValidationMiddleware {
  // Format errors with i18n support
  static formatErrors(req, errors) {
    return errors.array().map(error => {
      let message = error.msg;
      
      // If message is a translation key, translate it
      if (message.startsWith('validation.')) {
        message = req.__(message);
        
        // Handle interpolation for min/max values
        if (error.msg === 'validation.minLength' && error.options) {
          message = message.replace('{{min}}', error.options.min);
        }
        if (error.msg === 'validation.maxLength' && error.options) {
          message = message.replace('{{max}}', error.options.max);
        }
        if (error.msg === 'validation.oneOf' && error.options) {
          message = message.replace('{{values}}', error.options.join(', '));
        }
      }
      
      return {
        field: error.path,
        message: message,
        value: error.value,
        location: error.location
      };
    });
  }

  // Main validation handler
  static handle(validations) {
    return async (req, res, next) => {
      // Execute all validations
      await Promise.all(validations.map(validation => validation.run(req)));
      
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        const formattedErrors = this.formatErrors(req, errors);
        
        return res.status(422).json({
          success: false,
          message: req.__('Validation failed'),
          errors: formattedErrors,
          // Include locale info for debugging
          locale: req.getLocale()
        });
      }
      
      next();
    };
  }

  // Sanitize middleware
  static sanitize(fields) {
    return (req, res, next) => {
      fields.forEach(field => {
        if (req.body[field]) {
          req.body[field] = req.body[field].trim();
        }
      });
      next();
    };
  }
}

module.exports = ValidationMiddleware;
