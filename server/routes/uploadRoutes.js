const express = require('express')
const router = express.Router()
const { uploadProductImage } = require('../controllers/uploadController')

router.post('/product-image', uploadProductImage)

module.exports = router
