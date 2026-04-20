const express = require('express')
const i18n = require('i18n')
const { body, validationResult } = require('express-validator')
const path = require('path')
//routes
const registerRouter = require('./routes/register.router')
const loginRouter = require('./routes/login.router')
const localeRouter = require('./routes/locale.router')
//validation
const userRegisterValidation = require('./validation/user-registration-validation')
const loginValidation = require('./validation/login-validation')

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
})

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(i18n.init)

// Custom validation message formatter using i18n
const createValidationMiddleware = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)))
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      // Translate error messages
      const translatedErrors = errors.array().map(error => ({
        ...error,
        msg: req.__(error.msg) // Translate the message key
      }))
      
      return res.status(400).json({
        success: false,
        errors: translatedErrors
      })
    }
    next()
  }
}


app.use('/api/register', createValidationMiddleware(userRegisterValidation), registerRouter)
app.use('/api/login', createValidationMiddleware(loginValidation), loginRouter)
app.use('/api/locale', localeRouter)

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    success: false, 
    message: req.__('Internal server error') 
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log('Available locales: en, es, fr')
  console.log('Try: curl -X POST "http://localhost:3000/api/register?lang=es" -H "Content-Type: application/json" -d \'{"username":"ad"}\'')
})
