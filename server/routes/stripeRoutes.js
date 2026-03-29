const express = require('express')
const router = express.Router()
const { createCheckoutSession, confirmCheckoutSession } = require('../controllers/stripeController')
const { authenticateToken } = require('../middleware/authMiddleware')

router.post('/checkout', authenticateToken, createCheckoutSession)
router.get('/confirm/:sessionId', authenticateToken, confirmCheckoutSession)

module.exports = router
