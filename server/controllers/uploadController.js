const path = require('path')
const fs = require('fs')

async function uploadProductImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const { productName } = req.body

    if (!productName) {
      // Clean up uploaded file if product name is missing
      fs.unlinkSync(req.file.path)
      return res.status(400).json({ message: 'Product name is required' })
    }

    // Generate filename from product name (convert to kebab-case and ensure .png)
    const safeProductName = productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '') // Trim hyphens from ends

    const filename = `${safeProductName}.png`
    const publicProductsDir = path.join(__dirname, '../../client/public/products')
    
    // Ensure directory exists
    if (!fs.existsSync(publicProductsDir)) {
      fs.mkdirSync(publicProductsDir, { recursive: true })
    }

    const targetPath = path.join(publicProductsDir, filename)

    // Move file to target location
    fs.renameSync(req.file.path, targetPath)

    // Return the image path that should be stored in the product
    return res.json({ 
      imagePath: `/products/${filename}`,
      filename: filename
    })
  } catch (error) {
    console.error('uploadProductImage error:', error)
    
    // Clean up file if something went wrong
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    
    return res.status(500).json({ message: 'Failed to upload image' })
  }
}

module.exports = {
  uploadProductImage
}
