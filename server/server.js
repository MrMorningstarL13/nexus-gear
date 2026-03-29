require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const authRoutes = require('./routes/authRoutes')
const wishlistRoutes = require('./routes/wishlistRoutes')
const stripeRoutes = require('./routes/stripeRoutes')

const app = express()
const port = process.env.PORT || 8080

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/stripe', stripeRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Nexus Gear API running' })
})

app.listen(port, () => {
  console.log(`Nexus Gear server running: http://localhost:${port}`)
})