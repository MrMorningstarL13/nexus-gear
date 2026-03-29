const admin = require('firebase-admin')

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './ServiceAccountKey.json'

try {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
  })
} catch (error) {
  if (!/already exists/.test(error.message)) {
    throw error
  }
}

const db = admin.firestore()

module.exports = { db, admin }
