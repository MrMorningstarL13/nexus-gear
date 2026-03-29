const { db } = require('../firestore')

async function getWishlist(req, res) {
  try {
    const userId = req.user.id
    const userRef = db.collection('users').doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' })
    }

    const userData = userDoc.data()
    const wishlist = userData.wishlist || []

    res.json({ wishlist })
  } catch (error) {
    console.error('Error getting wishlist:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

async function addToWishlist(req, res) {
  try {
    const userId = req.user.id
    const { productId } = req.body

    if (!productId) {
      return res.status(400).json({ message: 'Product ID required' })
    }

    const userRef = db.collection('users').doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' })
    }

    const userData = userDoc.data()
    const wishlist = userData.wishlist || []

    if (!wishlist.includes(productId)) {
      wishlist.push(productId)
      await userRef.update({ wishlist })
    }

    res.json({ wishlist })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

async function removeFromWishlist(req, res) {
  try {
    const userId = req.user.id
    const { productId } = req.params

    if (!productId) {
      return res.status(400).json({ message: 'Product ID required' })
    }

    const userRef = db.collection('users').doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' })
    }

    const userData = userDoc.data()
    const wishlist = userData.wishlist || []

    const index = wishlist.indexOf(productId)
    if (index > -1) {
      wishlist.splice(index, 1)
      await userRef.update({ wishlist })
    }

    res.json({ wishlist })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist }