const express = require('express')
const multer = require('multer')
const path = require('path')
const router = express.Router()
const { uploadProductImage } = require('../controllers/uploadController')

// Configure multer for temporary file storage
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Use system temp directory
      cb(null, require('os').tmpdir())
    },
    filename: (req, file, cb) => {
      // Generate unique temp filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + path.extname(file.originalname))
    }
  }),
  fileFilter: (req, file, cb) => {
    // Only accept image files
    const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only PNG, JPEG, and WebP images are allowed'))
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

router.post('/product-image', upload.single('image'), uploadProductImage)

module.exports = router
