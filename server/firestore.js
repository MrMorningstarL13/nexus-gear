const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './ServiceAccountKey.json'

try {
  const resolvedPath = path.isAbsolute(serviceAccountPath)
    ? serviceAccountPath
    : path.resolve(__dirname, serviceAccountPath)

  if (fs.existsSync(resolvedPath)) {
    admin.initializeApp({
      credential: admin.credential.cert(require(resolvedPath)),
    })
  } else {
    admin.initializeApp()
  }
} catch (error) {
  if (!/already exists/.test(error.message)) {
    throw error
  }
}

const db = admin.firestore()

module.exports = { db, admin }
