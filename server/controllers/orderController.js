const PDFDocument = require('pdfkit')
const Stripe = require('stripe')
const { db, admin } = require('../firestore')

function getStripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) return null
  return Stripe(secret)
}

// Fallback data when Firestore is not available
const fallbackOrders = [
  {
    id: 'order-1',
    userId: 'user-1',
    userName: 'Alex Johnson',
    userEmail: 'alex@example.com',
    items: [
      { product: { id: 'mouse-1', name: 'Razer DeathAdder V3 Pro', price: 149.99 }, quantity: 1 },
    ],
    total: 149.99,
    status: 'shipped',
    createdAt: new Date().toISOString(),
  },
]

function formatDate(value) {
  if (!value) return new Date().toLocaleDateString()
  if (typeof value.toDate === 'function') return value.toDate().toLocaleDateString()
  const date = new Date(value)
  if (!Number.isNaN(date.getTime())) return date.toLocaleDateString()
  return new Date().toLocaleDateString()
}

function createInvoicePdf(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const shipping = order.shippingDetails || {}
    const subtotal = (order.items || []).reduce((sum, item) => {
      return sum + Number(item?.product?.price || 0) * Number(item?.quantity || 0)
    }, 0)
    const discountPercent = Number(order.discountPercent || 0)
    const discountAmount = subtotal * (discountPercent / 100)
    const finalTotal = Number(order.total || subtotal - discountAmount)

    doc.fontSize(24).text('INVOICE', { align: 'left' })
    doc.moveDown(0.5)
    doc.fontSize(11).text(`Invoice Date: ${formatDate(order.paidAt || order.createdAt)}`)
    doc.text(`Order ID: ${order.id}`)
    doc.text(`Status: ${order.status}`)
    doc.moveDown(1)

    doc.fontSize(13).text('Billing / Customer')
    doc.fontSize(11)
    doc.text(order.userName || 'N/A')
    doc.text(order.userEmail || 'N/A')
    doc.moveDown(1)

    doc.fontSize(13).text('Shipping Details')
    doc.fontSize(11)
    doc.text(shipping.name || order.userName || 'N/A')
    doc.text(shipping.addressLine1 || 'N/A')
    if (shipping.addressLine2) doc.text(shipping.addressLine2)
    doc.text(`${shipping.city || ''} ${shipping.postalCode || ''}`.trim() || 'N/A')
    doc.text(shipping.state || '')
    doc.text(shipping.country || 'N/A')
    doc.moveDown(1)

    doc.fontSize(13).text('Products')
    doc.moveDown(0.5)

    ;(order.items || []).forEach((item) => {
      const name = item?.product?.name || 'Unknown Product'
      const qty = Number(item?.quantity || 0)
      const unit = Number(item?.product?.price || 0)
      const lineTotal = unit * qty
      doc.fontSize(11).text(name)
      doc.fontSize(10).fillColor('gray').text(`Qty: ${qty} x EUR ${unit.toFixed(2)} = EUR ${lineTotal.toFixed(2)}`)
      doc.fillColor('black').moveDown(0.4)
    })

    doc.moveDown(0.8)
    doc.fontSize(11).text(`Subtotal: EUR ${subtotal.toFixed(2)}`, { align: 'right' })
    if (discountPercent > 0) {
      doc.text(`Discount (${discountPercent}%): -EUR ${discountAmount.toFixed(2)}`, { align: 'right' })
    }
    doc.fontSize(13).text(`Total: EUR ${finalTotal.toFixed(2)}`, { align: 'right' })

    doc.end()
  })
}

function extractShippingFromStripeSession(session) {
  return {
    name: session.shipping_details?.name || session.customer_details?.name || '',
    addressLine1: session.shipping_details?.address?.line1 || session.customer_details?.address?.line1 || '',
    addressLine2: session.shipping_details?.address?.line2 || session.customer_details?.address?.line2 || '',
    city: session.shipping_details?.address?.city || session.customer_details?.address?.city || '',
    state: session.shipping_details?.address?.state || session.customer_details?.address?.state || '',
    postalCode: session.shipping_details?.address?.postal_code || session.customer_details?.address?.postal_code || '',
    country: session.shipping_details?.address?.country || session.customer_details?.address?.country || '',
  }
}

async function listOrders(req, res) {
  try {
    const snapshot = await db.collection('orders').get()
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return res.json(orders)
  } catch (error) {
    console.error('listOrders error:', error)
    console.log('Using fallback order data')
    return res.json(fallbackOrders)
  }
}

async function updateOrder(req, res) {
  const { id } = req.params
  const updates = req.body

  try {
    const docRef = db.collection('orders').doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return res.status(404).json({ message: 'Order not found' })
    }

    await docRef.update({ ...updates, updatedAt: admin.firestore.FieldValue.serverTimestamp() })
    const updated = await docRef.get()
    return res.json({ id: updated.id, ...updated.data() })
  } catch (error) {
    console.error('updateOrder error:', error)
    return res.status(500).json({ message: 'Could not update order' })
  }
}

async function createOrder(req, res) {
  const { userId, userName, userEmail, items, total } = req.body

  if (!userId || !userName || !userEmail || !items || !total) {
    return res.status(400).json({ message: 'Missing order fields' })
  }

  try {
    const docRef = await db.collection('orders').add({
      userId,
      userName,
      userEmail,
      items,
      total,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    const orderDoc = await docRef.get()
    return res.status(201).json({ id: orderDoc.id, ...orderDoc.data() })
  } catch (error) {
    console.error('createOrder error:', error)
    return res.status(500).json({ message: 'Could not create order' })
  }
}

async function listUserOrders(req, res) {
  const userId = req.user.id
  try {
    const snapshot = await db.collection('orders').where('userId', '==', userId).get()
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return res.json(orders)
  } catch (error) {
    console.error('listUserOrders error:', error)
    return res.status(500).json({ message: 'Could not fetch orders' })
  }
}

async function getOrderInvoice(req, res) {
  const { id } = req.params
  const disposition = req.query.disposition === 'download' ? 'attachment' : 'inline'
  const stripe = getStripeClient()

  try {
    const docRef = db.collection('orders').doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return res.status(404).json({ message: 'Order not found' })
    }

    let order = { id: doc.id, ...doc.data() }

    if (!req.user.isAdmin && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this invoice' })
    }

    if (order.status === 'awaiting_payment') {
      return res.status(400).json({ message: 'Invoice not available before payment confirmation' })
    }

    // Backfill shipping details for older orders when possible.
    const hasShipping = Boolean(
      order.shippingDetails &&
      (order.shippingDetails.name || order.shippingDetails.addressLine1 || order.shippingDetails.city || order.shippingDetails.country)
    )
    if (!hasShipping && order.stripeSessionId && stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId)
        const shippingDetails = extractShippingFromStripeSession(session)
        const hasRecovered = Boolean(
          shippingDetails.name || shippingDetails.addressLine1 || shippingDetails.city || shippingDetails.country
        )
        if (hasRecovered) {
          await docRef.update({
            shippingDetails,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })
          order = { ...order, shippingDetails }
        }
      } catch (stripeError) {
        console.warn('Could not backfill shipping details from Stripe:', stripeError.message)
      }
    }

    const pdfBuffer = await createInvoicePdf(order)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `${disposition}; filename="invoice-${order.id}.pdf"`)
    return res.send(pdfBuffer)
  } catch (error) {
    console.error('getOrderInvoice error:', error)
    return res.status(500).json({ message: 'Could not generate invoice' })
  }
}

module.exports = {
  listOrders,
  updateOrder,
  createOrder,
  listUserOrders,
  getOrderInvoice,
}
