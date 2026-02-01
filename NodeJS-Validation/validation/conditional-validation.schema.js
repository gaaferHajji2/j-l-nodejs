const { body } = require('express-validator')

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

module.exports = { conditionalValidation }