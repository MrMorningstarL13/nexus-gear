const { randomUUID } = require('crypto')
const { admin } = require('../firestore')

async function uploadProductImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const { productName } = req.body

    if (!productName) {
      return res.status(400).json({ message: 'Product name is required' })
    }

    // Generate filename from product name in kebab-case and enforce .png.
    const safeProductName = productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')

    if (!safeProductName) {
      return res.status(400).json({ message: 'Product name must include letters or numbers' })
    }

    const filename = `${safeProductName}.png`
    const objectPath = `products/${filename}`
    const bucket = admin.storage().bucket()

    if (!bucket || !bucket.name) {
      return res.status(500).json({ message: 'Storage bucket is not configured' })
    }

    const file = bucket.file(objectPath)

    const [exists] = await file.exists()
    if (exists) {
      return res.status(409).json({ message: 'A product with this name already exists. Please choose a different name.' })
    }

    const token = randomUUID()
    await file.save(req.file.buffer, {
      resumable: false,
      contentType: 'image/png',
      metadata: {
        contentType: 'image/png',
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    })

    const imagePath = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`

    // Return a stable Firebase download URL for storing on the product.
    return res.json({ 
      imagePath,
      filename: filename
    })
  } catch (error) {
    console.error('uploadProductImage error:', error)

    return res.status(500).json({ message: 'Failed to upload image' })
  }
}

module.exports = {
  uploadProductImage
}
