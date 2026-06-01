import { body, param, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

// Validation rules for creating a task
const createTaskValidation = [
  // Validate 'name' field
  body('name')
    .notEmpty()
    .withMessage('Task name is required')
    .isString()
    .withMessage('Task name must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Task name cannot exceed 100 characters'),

  // Validate 'description' field (optional but validated if present)
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  // Validate 'user_id' field
  body('user_id')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid User ID format'),
];

export {
  createTaskValidation,
  handleValidationErrors,
};