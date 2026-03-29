const express = require('express')
const router = express.Router()
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController')
const { authenticateToken } = require('../middleware/authMiddleware')

router.get('/', authenticateToken, getWishlist)
router.post('/add', authenticateToken, addToWishlist)
router.delete('/remove/:productId', authenticateToken, removeFromWishlist)

module.exports = router