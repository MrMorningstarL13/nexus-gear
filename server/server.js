require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const authRoutes = require('./routes/authRoutes')
const wishlistRoutes = require('./routes/wishlistRoutes')
const stripeRoutes = require('./routes/stripeRoutes')
const uploadRoutes = require('./routes/uploadRoutes')

const app = express()
const port = process.env.APP_PORT || 8080

function normalizeOrigin(value) {
  return typeof value === 'string' ? value.replace(/\/+$/, '') : ''
}

const allowedOrigins = new Set([
  'http://localhost:3000',
  'https://nexus-gear-backend--nexus-gear-96fb4.europe-west4.hosted.app',
])

const configuredFrontendOrigin = normalizeOrigin(process.env.FRONTEND_ORIGIN)
if (configuredFrontendOrigin) {
  allowedOrigins.add(configuredFrontendOrigin)
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.has(normalizeOrigin(origin))) {
      return callback(null, true)
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json())
app.use(morgan('dev'))

app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/stripe', stripeRoutes)
app.use('/api/upload', uploadRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Nexus Gear API running' })
})

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Nexus Gear server running: http://localhost:${port}`)
  })
}

module.exports = app