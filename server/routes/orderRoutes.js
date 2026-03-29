const express = require('express')
const router = express.Router()
const { listOrders, updateOrder, createOrder, listUserOrders, getOrderInvoice } = require('../controllers/orderController')
const { authenticateToken } = require('../middleware/authMiddleware')

router.get('/my', authenticateToken, listUserOrders)
router.get('/:id/invoice', authenticateToken, getOrderInvoice)
router.get('/', listOrders)
router.put('/:id', updateOrder)
router.post('/', createOrder)

module.exports = router
