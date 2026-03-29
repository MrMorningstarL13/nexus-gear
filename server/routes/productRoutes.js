const express = require('express')
const router = express.Router()
const { listProducts, updateProduct } = require('../controllers/productController')

router.get('/', listProducts)
router.put('/:id', updateProduct)

module.exports = router
