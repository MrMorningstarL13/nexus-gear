const { db, admin } = require('../firestore')

// Fallback data when Firestore is not available
const fallbackProducts = [
  {
    id: 'mouse-1',
    name: 'Razer DeathAdder V3 Pro',
    category: 'mice',
    price: 149.99,
    originalPrice: 189.99,
    discount: 21,
    image: '/products/razer-deathadder-v3-pro.png',
    images: ['/products/razer-deathadder-v3-pro.png'],
    description: 'The iconic ergonomic esports mouse, now even lighter at just 63g with Focus Pro 30K Optical Sensor and up to 90 hours of battery life.',
    specs: {
      'DPI': '30,000',
      'Polling Rate': '4000Hz (with dongle)',
      'Weight': '63g',
      'Sensor': 'Focus Pro 30K',
      'Connectivity': 'HyperSpeed Wireless',
      'Battery Life': '90 hours',
      'Switches': 'Optical Gen-3'
    },
    inStock: true,
    stockCount: 45,
    featured: true,
    handSizes: ['M', 'L'],
    gripTypes: ['Palm', 'Claw'],
    gameGenres: ['FPS']
  },
  {
    id: 'mouse-2',
    name: 'Logitech G Pro X Superlight 2',
    category: 'mice',
    price: 159.99,
    image: '/products/pro-x-superlight-2-white.png',
    images: ['/products/pro-x-superlight-2-white.png'],
    description: 'The pinnacle of wireless gaming mice. Weighing less than 60 grams with HERO 2 sensor and LIGHTSPEED wireless technology.',
    specs: {
      'DPI': '32,000',
      'Polling Rate': '2000Hz',
      'Weight': '60g',
      'Sensor': 'HERO 2',
      'Connectivity': 'LIGHTSPEED Wireless',
      'Battery Life': '95 hours',
      'Switches': 'LIGHTFORCE Hybrid'
    },
    inStock: true,
    stockCount: 78,
    featured: true,
    handSizes: ['S', 'M'],
    gripTypes: ['Claw', 'Tip'],
    gameGenres: ['FPS', 'MOBA']
  }
]

async function listProducts(req, res) {
  try {
    const snapshot = await db.collection('products').get()
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return res.json(products)
  } catch (error) {
    console.error('listProducts error:', error)
    return res.status(500).json({ message: 'Could not fetch products' })
  }
}

async function updateProduct(req, res) {
  const { id } = req.params
  const updates = req.body

  try {
    const docRef = db.collection('products').doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await docRef.update({ ...updates, updatedAt: admin.firestore.FieldValue.serverTimestamp() })
    const updated = await docRef.get()
    return res.json({ id: updated.id, ...updated.data() })
  } catch (error) {
    console.error('updateProduct error:', error)
    return res.status(500).json({ message: 'Could not update product' })
  }
}

async function deleteProduct(req, res) {
  const { id } = req.params

  try {
    const docRef = db.collection('products').doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await docRef.delete()
    return res.json({ message: 'Product deleted' })
  } catch (error) {
    console.error('deleteProduct error:', error)
    return res.status(500).json({ message: 'Could not delete product' })
  }
}

async function createProduct(req, res) {
  const { name, category, price, image, images, description, specs, stockCount, discount, originalPrice, featured, inStock } = req.body

  // Validation
  if (!name || !category || !price || !image) {
    return res.status(400).json({ message: 'Missing required fields: name, category, price, image' })
  }

  try {
    const docRef = db.collection('products').doc()
    const newProduct = {
      name,
      category,
      price: parseFloat(price),
      image,
      images: images || [image],
      description: description || '',
      specs: specs || {},
      stockCount: parseInt(stockCount) || 0,
      inStock: inStock !== undefined ? inStock : (parseInt(stockCount) > 0),
      featured: featured || false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }

    // Only add optional fields if they have values
    if (discount) {
      newProduct.discount = parseInt(discount)
    }
    if (originalPrice) {
      newProduct.originalPrice = parseFloat(originalPrice)
    }

    await docRef.set(newProduct)
    const created = await docRef.get()
    return res.json({ id: created.id, ...created.data() })
  } catch (error) {
    console.error('createProduct error:', error)
    return res.status(500).json({ message: 'Could not create product' })
  }
}

module.exports = {
  listProducts,
  updateProduct,
  deleteProduct,
  createProduct
}

