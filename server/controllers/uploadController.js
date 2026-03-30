const { randomUUID } = require('crypto')
const Busboy = require('busboy')
const { admin } = require('../firestore')

function parseMultipartRequest(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || ''
    if (!contentType.includes('multipart/form-data')) {
      reject(new Error('Content-Type must be multipart/form-data'))
      return
    }

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: 10 * 1024 * 1024,
      },
    })

    let productName = ''
    let fileBuffer = null
    let fileMimeType = ''
    let gotFile = false

    busboy.on('field', (fieldname, value) => {
      if (fieldname === 'productName') {
        productName = value
      }
    })

    busboy.on('file', (_fieldname, file, info) => {
      gotFile = true
      fileMimeType = info.mimeType || ''
      const chunks = []

      file.on('data', (chunk) => {
        chunks.push(chunk)
      })

      file.on('limit', () => {
        reject(new Error('File too large (max 10MB)'))
      })

      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks)
      })
    })

    busboy.on('error', (error) => {
      reject(error)
    })

    busboy.on('finish', () => {
      resolve({ productName, fileBuffer, fileMimeType, gotFile })
    })

    if (req.rawBody && req.rawBody.length > 0) {
      busboy.end(req.rawBody)
      return
    }

    req.pipe(busboy)
  })
}

async function uploadProductImage(req, res) {
  try {
    const { productName, fileBuffer, fileMimeType, gotFile } = await parseMultipartRequest(req)

    if (!gotFile || !fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    if (!productName) {
      return res.status(400).json({ message: 'Product name is required' })
    }

    if (fileMimeType !== 'image/png') {
      return res.status(400).json({ message: 'Only PNG images are allowed' })
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
    await file.save(fileBuffer, {
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

    return res.status(500).json({
      message: 'Failed to upload image',
      detail: error instanceof Error ? error.message : 'Unknown upload error',
    })
  }
}

module.exports = {
  uploadProductImage
}
