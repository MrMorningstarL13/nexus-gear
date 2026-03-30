const express = require('express')
const router = express.Router()
const { listProducts, updateProduct, deleteProduct, createProduct } = require('../controllers/productController')

router.get('/', listProducts)
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

module.exports = router
