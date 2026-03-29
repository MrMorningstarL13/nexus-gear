const Stripe = require('stripe')
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const { db, admin } = require('../firestore')

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'

// Mirrors the bundle discount logic from the frontend store
function calculateBundleDiscount(cart) {
  const bundleCategories = ['mice', 'keyboards', 'headsets']
  const cartCategories = new Set(cart.map((item) => item.product.category))
  const matching = bundleCategories.filter((c) => cartCategories.has(c))
  if (matching.length === 3) return 15
  if (matching.length === 2) return 5
  return 0
}

async function createCheckoutSession(req, res) {
  const { cart, email } = req.body
  const userId = req.user.id
  const userName = req.user.name || req.user.email
  const userEmail = req.user.email

  if (!cart || cart.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' })
  }

  try {
    const lineItems = cart.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.product.name,
          images: item.product.image ? [`http://localhost:3000${item.product.image}`] : [],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }))

    const discountPercent = calculateBundleDiscount(cart)
    let discounts = []
    if (discountPercent > 0) {
      const coupon = await stripe.coupons.create({
        percent_off: discountPercent,
        duration: 'once',
        name: `Bundle Discount ${discountPercent}%`,
      })
      discounts = [{ coupon: coupon.id }]
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email || userEmail || undefined,
      line_items: lineItems,
      discounts,
      shipping_address_collection: {
        allowed_countries: ['US', 'GB', 'DE', 'FR', 'RO', 'IT', 'ES', 'NL', 'BE', 'AT', 'PL', 'CZ', 'HU', 'SK', 'SI', 'HR', 'BG', 'SE', 'DK', 'FI', 'NO', 'CH'],
      },
      success_url: `${CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/checkout/cancel`,
    })

    // Save a pre-order with the discounted total
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const total = subtotal * (1 - discountPercent / 100)
    await db.collection('orders').add({
      userId,
      userName,
      userEmail,
      items: cart,
      total: parseFloat(total.toFixed(2)),
      discountPercent,
      status: 'awaiting_payment',
      stripeSessionId: session.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    res.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ message: error.message || 'Failed to create Stripe session' })
  }
}

async function confirmCheckoutSession(req, res) {
  const { sessionId } = req.params

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID required' })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return res.status(402).json({ message: 'Payment not completed' })
    }

    const result = await db.runTransaction(async (tx) => {
      const orderQuery = db.collection('orders').where('stripeSessionId', '==', sessionId).limit(1)
      const orderSnapshot = await tx.get(orderQuery)

      if (orderSnapshot.empty) {
        throw Object.assign(new Error('Order not found'), { statusCode: 404 })
      }

      const orderRef = orderSnapshot.docs[0].ref
      const orderData = orderSnapshot.docs[0].data()

      // Idempotency: if already processed, do not decrement stock again.
      if (orderData.status !== 'awaiting_payment') {
        return { id: orderRef.id, ...orderData }
      }

      for (const item of orderData.items || []) {
        const productId = item?.product?.id
        const quantity = Number(item?.quantity || 0)
        if (!productId || quantity <= 0) continue

        const productRef = db.collection('products').doc(productId)
        const productDoc = await tx.get(productRef)

        if (!productDoc.exists) {
          throw Object.assign(new Error(`Product ${productId} not found`), { statusCode: 404 })
        }

        const productData = productDoc.data() || {}
        const currentStock = Number(productData.stockCount || 0)

        if (currentStock < quantity) {
          throw Object.assign(new Error(`Insufficient stock for product ${productId}`), { statusCode: 409 })
        }

        const newStock = currentStock - quantity
        tx.update(productRef, {
          stockCount: newStock,
          inStock: newStock > 0,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      }

      tx.update(orderRef, {
        status: 'pending',
        shippingDetails: {
          name: session.shipping_details?.name || session.customer_details?.name || '',
          addressLine1: session.shipping_details?.address?.line1 || session.customer_details?.address?.line1 || '',
          addressLine2: session.shipping_details?.address?.line2 || session.customer_details?.address?.line2 || '',
          city: session.shipping_details?.address?.city || session.customer_details?.address?.city || '',
          state: session.shipping_details?.address?.state || session.customer_details?.address?.state || '',
          postalCode: session.shipping_details?.address?.postal_code || session.customer_details?.address?.postal_code || '',
          country: session.shipping_details?.address?.country || session.customer_details?.address?.country || '',
        },
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      return {
        id: orderRef.id,
        ...orderData,
        status: 'pending',
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Stripe confirm error:', error)
    const statusCode = error.statusCode || 500
    res.status(statusCode).json({ message: error.message || 'Failed to confirm session' })
  }
}

module.exports = { createCheckoutSession, confirmCheckoutSession }
