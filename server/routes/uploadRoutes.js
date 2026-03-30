const express = require('express')
const multer = require('multer')
const router = express.Router()
const { uploadProductImage } = require('../controllers/uploadController')

// Keep files in memory and stream to Firebase Storage from controller.
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Require PNG uploads so saved objects always match product-name.png.
    const allowedMimes = ['image/png']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only PNG images are allowed'))
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

router.post('/product-image', upload.single('image'), uploadProductImage)

module.exports = router
