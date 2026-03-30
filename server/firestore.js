const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './ServiceAccountKey.json'

function resolveStorageBucket() {
  const explicitBucket = process.env.FIREBASE_STORAGE_BUCKET
  if (explicitBucket && explicitBucket.trim()) {
    return explicitBucket.replace(/^gs:\/\//, '').trim()
  }

  const firebaseConfig = process.env.FIREBASE_CONFIG
  if (firebaseConfig) {
    try {
      const parsed = JSON.parse(firebaseConfig)
      if (parsed.storageBucket) {
        return String(parsed.storageBucket).replace(/^gs:\/\//, '').trim()
      }
    } catch (error) {
      // Ignore malformed FIREBASE_CONFIG and continue with other fallbacks.
    }
  }

  const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT
  if (projectId) {
    return `${projectId}.appspot.com`
  }

  return undefined
}

const storageBucket = resolveStorageBucket()

try {
  const resolvedPath = path.isAbsolute(serviceAccountPath)
    ? serviceAccountPath
    : path.resolve(__dirname, serviceAccountPath)

  if (fs.existsSync(resolvedPath)) {
    admin.initializeApp({
      credential: admin.credential.cert(require(resolvedPath)),
      ...(storageBucket ? { storageBucket } : {}),
    })
  } else {
    admin.initializeApp(
      storageBucket ? { storageBucket } : undefined
    )
  }
} catch (error) {
  if (!/already exists/.test(error.message)) {
    throw error
  }
}

const db = admin.firestore()

module.exports = { db, admin }
