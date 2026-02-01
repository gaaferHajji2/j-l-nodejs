const { body } = require('express-validator')
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

module.exports = { asyncValidation }