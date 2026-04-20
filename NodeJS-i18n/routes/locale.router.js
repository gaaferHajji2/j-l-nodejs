const router = require('express').Router()

// Get available locales
router.get('/api/locales', (req, res) => {
  res.json({
    current: req.getLocale(),
    available: req.getLocales()
  });
});

// Change locale manually
router.post('/api/locale', (req, res) => {
  const { locale } = req.body;
  if (req.getLocales().includes(locale)) {
    req.setLocale(locale);
    res.json({ success: true, locale: req.getLocale() });
  } else {
    res.status(400).json({ success: false, message: 'Invalid locale' });
  }
});

module.exports = router