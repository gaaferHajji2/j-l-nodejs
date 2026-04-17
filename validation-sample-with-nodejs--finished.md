I'll create a comprehensive example of request body validation in Node.js using Express and the popular `express-validator` library. This will include various validation patterns you'll commonly need.

```javascript
// ============================================
// Express Request Body Validation Example
// ============================================

const express = require('express');
const { body, validationResult, param, query } = require('express-validator');

const app = express();
app.use(express.json());

// ============================================
// 1. BASIC USER REGISTRATION VALIDATION
// ============================================

const userRegistrationValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter'),
  
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  
  body('newsletter')
    .optional()
    .isBoolean()
    .withMessage('Newsletter must be a boolean value')
];

// ============================================
// 2. ORDER/PRODUCT VALIDATION
// ============================================

const orderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.productId')
    .isUUID()
    .withMessage('Each item must have a valid product UUID'),
  
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('shippingAddress.zipCode')
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Invalid ZIP code format'),
  
  body('couponCode')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('Invalid coupon code format')
];

// ============================================
// 3. CUSTOM VALIDATORS
// ============================================

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

// ============================================
// 4. VALIDATION ERROR HANDLER MIDDLEWARE
// ============================================

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format errors for better readability
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

// ============================================
// 5. ROUTES
// ============================================

// User registration route
app.post(
  '/api/users/register',
  userRegistrationValidation,
  handleValidationErrors,
  async (req, res) => {
    // If we reach here, validation passed
    const { email, username, password } = req.body;
    
    // Your registration logic here...
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { email, username }
    });
  }
);

// Order creation route
app.post(
  '/api/orders',
  orderValidation,
  handleValidationErrors,
  (req, res) => {
    res.json({
      success: true,
      message: 'Order created',
      order: req.body
    });
  }
);

// Route with multiple validation types (body + params + query)
app.get(
  '/api/users/:userId/posts',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort must be asc or desc')
  ],
  handleValidationErrors,
  (req, res) => {
    res.json({
      userId: req.params.userId,
      query: req.query
    });
  }
);

// ============================================
// 6. SANITIZATION EXAMPLE
// ============================================

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

app.post('/api/profile', sanitizeExample, handleValidationErrors, (req, res) => {
  // All inputs are now sanitized
  res.json({ sanitized: req.body });
});

// ============================================
// 7. CONDITIONAL VALIDATION
// ============================================

const conditionalValidation = [
  body('accountType')
    .isIn(['personal', 'business'])
    .withMessage('Account type must be personal or business'),
  
  // Only require companyName if accountType is 'business'
  body('companyName')
    .if(body('accountType').equals('business'))
    .notEmpty()
    .withMessage('Company name is required for business accounts'),
  
  body('taxId')
    .if(body('accountType').equals('business'))
    .matches(/^\d{2}-\d{7}$/)
    .withMessage('Valid Tax ID required for business accounts')
];

app.post('/api/accounts', conditionalValidation, handleValidationErrors, (req, res) => {
  res.json({ account: req.body });
});

// ============================================
// 8. ASYNC VALIDATION (Database Check)
// ============================================

const { check } = require('express-validator');

const asyncValidation = [
  body('email')
    .isEmail()
    .custom(async (value) => {
      // Simulate database check
      const userExists = await checkEmailExists(value);
      if (userExists) {
        throw new Error('Email already registered');
      }
      return true;
    }),
  
  body('referralCode')
    .optional()
    .custom(async (value) => {
      const isValid = await validateReferralCode(value);
      if (!isValid) {
        throw new Error('Invalid referral code');
      }
      return true;
    })
];

// Mock database functions
async function checkEmailExists(email) {
  // Replace with actual DB query
  return false;
}

async function validateReferralCode(code) {
  // Replace with actual validation
  return code === 'VALID123';
}

app.post('/api/async-validation', asyncValidation, handleValidationErrors, (req, res) => {
  res.json({ message: 'Validation passed including async checks' });
});

// ============================================
// ERROR HANDLING & START SERVER
// ============================================

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ============================================
// TEST EXAMPLES (using curl)
// ============================================

/*
# Valid request:
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "username": "john_doe",
    "age": 25
  }'

# Invalid request (missing fields, weak password):
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123",
    "username": "ab"
  }'

# Valid order:
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"productId": "550e8400-e29b-41d4-a716-446655440000", "quantity": 2}
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "zipCode": "12345"
    }
  }'
*/
```

## Key Features Covered:

| Feature | Description |
|---------|-------------|
| **Basic Validation** | Email, password strength, length checks |
| **Sanitization** | Trim, escape HTML, normalize data |
| **Custom Validators** | URL validation, age calculation, password matching |
| **Array Validation** | Wildcard `items.*.field` for validating arrays |
| **Conditional Validation** | Fields required only when other conditions met |
| **Async Validation** | Database existence checks |
| **Error Formatting** | Clean, structured error responses |

## Installation

```bash
npm install express express-validator
```

This example provides production-ready patterns with proper error handling, sanitization to prevent XSS, and comprehensive validation chains that cover most real-world scenarios.