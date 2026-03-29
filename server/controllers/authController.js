const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { db, admin } = require('../firestore')

const JWT_SECRET = process.env.JWT_SECRET || 'nexusgear-secret'
const JWT_EXPIRES_IN = '7d'

// Fallback users when Firestore is not available
const fallbackUsers = [
  {
    id: 'admin-1',
    email: 'admin@nexusgear.com',
    name: 'Admin User',
    password: bcrypt.hashSync('admin123', 10),
    isAdmin: true
  },
  {
    id: 'user-1',
    email: 'user@nexusgear.com',
    name: 'Test User',
    password: bcrypt.hashSync('user123', 10),
    isAdmin: false
  }
]

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })
}

async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }

  try {
    const usersRef = db.collection('users')
    const snapshot = await usersRef.where('email', '==', email).limit(1).get()

    if (snapshot.empty) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const doc = snapshot.docs[0]
    const user = { id: doc.id, ...doc.data() }

    const passwordMatches = bcrypt.compareSync(password, user.password)
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = createToken(user)
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin } })
  } catch (error) {
    console.error('login error:', error)
    // Fallback to static users when Firestore is not available
    console.log('Using fallback authentication')
    const user = fallbackUsers.find(u => u.email === email)
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    const token = createToken(user)
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin } })
  }
}

async function register(req, res) {
  const { name, email, password, isAdmin } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password required' })
  }

  try {
    const usersRef = db.collection('users')
    const snapshot = await usersRef.where('email', '==', email).limit(1).get()

    if (!snapshot.empty) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const newUser = {
      name,
      email,
      password: hashedPassword,
      isAdmin: Boolean(isAdmin),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }

    const docRef = await usersRef.add(newUser)
    const userSnapshot = await docRef.get()
    const createdUser = { id: docRef.id, ...userSnapshot.data() }

    const token = createToken(createdUser)
    return res.status(201).json({ token, user: { id: createdUser.id, email: createdUser.email, name: createdUser.name, isAdmin: createdUser.isAdmin } })
  } catch (error) {
    console.error('register error:', error)
    // Fallback registration when Firestore is not available
    console.log('Using fallback registration')
    const existingUser = fallbackUsers.find(u => u.email === email)
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      isAdmin: Boolean(isAdmin)
    }
    
    fallbackUsers.push(newUser)
    const token = createToken(newUser)
    return res.status(201).json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name, isAdmin: newUser.isAdmin } })
  }
}

module.exports = {
  login,
  register
}
