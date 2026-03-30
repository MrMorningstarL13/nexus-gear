const { db, admin } = require('./firestore')

const products = [
  {
    id: 'mouse-1',
    name: 'Razer DeathAdder V3 Pro',
    category: 'mice',
    price: 149.99,
    originalPrice: 189.99,
    discount: 21,
    image: '/products/razer-deathadder-v3-pro.png',
    images: ['/products/razer-deathadder-v3-pro.png'],
    description: 'The iconic ergonomic esports mouse, now even lighter at just 63g with Focus Pro 30K Optical Sensor and up to 90 hours of battery life.',
    specs: {
      DPI: '30,000',
      'Polling Rate': '4000Hz (with dongle)',
      Weight: '63g',
      Sensor: 'Focus Pro 30K',
      Connectivity: 'HyperSpeed Wireless',
      'Battery Life': '90 hours',
      Switches: 'Optical Gen-3'
    },
    inStock: true,
    stockCount: 45,
    featured: true,
    handSizes: ['M', 'L'],
    gripTypes: ['Palm', 'Claw'],
    gameGenres: ['FPS']
  },
  {
    id: 'mouse-2',
    name: 'Logitech G Pro X Superlight 2',
    category: 'mice',
    price: 159.99,
    image: '/products/pro-x-superlight-2-white.png',
    images: ['/products/pro-x-superlight-2-white.png'],
    description: 'The pinnacle of wireless gaming mice. Weighing less than 60 grams with HERO 2 sensor and LIGHTSPEED wireless technology.',
    specs: {
      DPI: '32,000',
      'Polling Rate': '2000Hz',
      Weight: '60g',
      Sensor: 'HERO 2',
      Connectivity: 'LIGHTSPEED Wireless',
      'Battery Life': '95 hours',
      Switches: 'LIGHTFORCE Hybrid'
    },
    inStock: true,
    stockCount: 78,
    featured: true,
    handSizes: ['S', 'M'],
    gripTypes: ['Claw', 'Tip'],
    gameGenres: ['FPS', 'MOBA']
  },
  {
    id: 'mouse-3',
    name: 'SteelSeries Aerox 5 Wireless',
    category: 'mice',
    price: 139.99,
    image: '/products/aerox_5_black_top.png',
    images: ['/products/aerox_5_black_top.png','/products/aerox_5_wl_black_side.png', '/products/aerox_5_wl_black_angled.png'],
    description: 'Ultra-lightweight 74g gaming mouse with 9 programmable buttons, AquaBarrier water resistance, and 180+ hour battery life.',
    specs: {
      DPI: '18,000',
      'Polling Rate': '1000Hz',
      Weight: '74g',
      Sensor: 'TrueMove Air',
      Connectivity: 'Quantum 2.0 Wireless',
      'Battery Life': '180 hours',
      Switches: 'Golden Micro IP54'
    },
    inStock: true,
    stockCount: 23,
    handSizes: ['M', 'L'],
    gripTypes: ['Palm', 'Claw'],
    gameGenres: ['FPS', 'MOBA']
  },
  {
    id: 'mouse-4',
    name: 'Razer Viper V3',
    category: 'mice',
    price: 159.99,
    image: '/products/razer-viper-v3-pro.png',
    images: ['/products/razer-viper-v3-pro.png'],
    description: 'The lightest esports mouse at just 54g with 8000Hz polling rate and Focus Pro 35K sensor for ultimate competitive performance.',
    specs: {
      DPI: '35,000',
      'Polling Rate': '8000Hz',
      Weight: '54g',
      Sensor: 'Focus Pro 35K',
      Connectivity: 'HyperSpeed Wireless',
      'Battery Life': '95 hours',
      Switches: 'Optical Gen-3'
    },
    inStock: true,
    stockCount: 120,
    featured: true,
    handSizes: ['S', 'M'],
    gripTypes: ['Tip', 'Claw'],
    gameGenres: ['FPS']
  },
  {
    id: 'mouse-5',
    name: 'Logitech G502 X Plus',
    category: 'mice',
    price: 159.99,
    originalPrice: 179.99,
    discount: 11,
    image: '/products/g502x-plus-black.png',
    images: ['/products/g502x-plus-black.png'],
    description: 'The legendary G502 reimagined with LIGHTFORCE hybrid switches, HERO 25K sensor, and LIGHTSYNC RGB.',
    specs: {
      DPI: '25,600',
      'Polling Rate': '1000Hz',
      Weight: '106g',
      Sensor: 'HERO 25K',
      Connectivity: 'LIGHTSPEED Wireless',
      'Battery Life': '130 hours',
      Switches: 'LIGHTFORCE Hybrid'
    },
    inStock: true,
    stockCount: 56,
    handSizes: ['L'],
    gripTypes: ['Palm'],
    gameGenres: ['MOBA', 'FPS']
  },
  {
    id: 'keyboard-1',
    name: 'Razer Huntsman V3 Pro TKL',
    category: 'keyboards',
    price: 249.99,
    originalPrice: 279.99,
    discount: 11,
    image: '/products/razer-huntsmanvV3-pro-tkl.png',
    images: ['/products/razer-huntsmanvV3-pro-tkl.png'],
    description: 'Rapid Trigger analog optical keyboard with adjustable actuation from 0.1mm to 4.0mm. The ultimate esports keyboard.',
    specs: {
      'Switch Type': 'Razer Analog Optical',
      Layout: 'TKL (87 keys)',
      Keycaps: 'Doubleshot PBT',
      Connectivity: 'USB-C',
      Lighting: 'Per-key Razer Chroma RGB',
      Features: 'Rapid Trigger, Adjustable Actuation'
    },
    inStock: true,
    stockCount: 34,
    featured: true,
    switchType: 'Red'
  },
  {
    id: 'keyboard-2',
    name: 'Logitech G Pro X TKL',
    category: 'keyboards',
    price: 199.99,
    image: '/products/logitech-pro-x-tkl-black-lightspeed-gaming-keyboard.png',
    images: ['/products/logitech-pro-x-tkl-black-lightspeed-gaming-keyboard.png'],
    description: 'Tournament-grade tenkeyless keyboard with LIGHTSPEED wireless, GX switches, and LIGHTSYNC RGB.',
    specs: {
      'Switch Type': 'GX Tactile',
      Layout: 'TKL (87 keys)',
      Keycaps: 'PBT',
      Connectivity: 'LIGHTSPEED Wireless + Bluetooth + USB-C',
      Lighting: 'LIGHTSYNC RGB',
      Features: 'Triple connectivity, Game Mode'
    },
    inStock: true,
    stockCount: 56,
    switchType: 'Brown'
  },
  {
    id: 'keyboard-3',
    name: 'SteelSeries Apex Pro TKL',
    category: 'keyboards',
    price: 189.99,
    image: '/products/apex_pro_tkl_gen_3.png',
    images: ['/products/apex_pro_tkl_gen_3.png'],
    description: 'World-first adjustable actuation switches with OmniPoint 2.0 technology. Customize actuation from 0.2mm to 3.8mm.',
    specs: {
      'Switch Type': 'OmniPoint 2.0 Adjustable',
      Layout: 'TKL (87 keys)',
      Keycaps: 'PBT',
      Connectivity: 'USB-C',
      Lighting: 'Per-key RGB',
      Features: 'Adjustable Actuation, OLED Smart Display'
    },
    inStock: true,
    stockCount: 41,
    featured: true,
    switchType: 'Red'
  },
  {
    id: 'keyboard-4',
    name: 'Razer BlackWidow V4 75%',
    category: 'keyboards',
    price: 189.99,
    image: '/products/razer-blackwidow-v4-75.png',
    images: ['/products/razer-blackwidow-v4-75.png'],
    description: 'Compact 75% layout with hot-swappable Razer Orange Tactile switches and aluminum top plate.',
    specs: {
      'Switch Type': 'Razer Orange Tactile',
      Layout: '75% (82 keys)',
      Keycaps: 'Doubleshot ABS',
      Connectivity: 'USB-C',
      Lighting: 'Razer Chroma RGB',
      Features: 'Hot-swappable, Media Roller'
    },
    inStock: true,
    stockCount: 18,
    switchType: 'Brown'
  },
  {
    id: 'keyboard-5',
    name: 'Logitech G915 TKL',
    category: 'keyboards',
    price: 229.99,
    originalPrice: 249.99,
    discount: 8,
    image: '/products/logitech-g915-tkl.png',
    images: ['/products/logitech-g915-tkl.png'],
    description: 'Ultra-thin mechanical gaming keyboard with low-profile GL switches and LIGHTSPEED wireless technology.',
    specs: {
      'Switch Type': 'GL Clicky',
      Layout: 'TKL (87 keys)',
      Keycaps: 'ABS',
      Connectivity: 'LIGHTSPEED Wireless + Bluetooth',
      Lighting: 'LIGHTSYNC RGB',
      Features: 'Low Profile, 40hr Battery'
    },
    inStock: false,
    stockCount: 0,
    switchType: 'Blue'
  },
  {
    id: 'headset-1',
    name: 'Razer BlackShark V2 Pro',
    category: 'headsets',
    price: 179.99,
    originalPrice: 199.99,
    discount: 10,
    image: '/products/razer-blackshark-v2-pro.png',
    images: ['/products/razer-blackshark-v2-pro.png'],
    description: 'Esports wireless headset with Razer TriForce Titanium 50mm drivers and HyperClear Super Wideband Mic.',
    specs: {
      'Driver Size': '50mm Titanium',
      'Frequency Response': '12Hz - 28kHz',
      Impedance: '32 Ohm',
      Microphone: 'HyperClear Super Wideband',
      Connectivity: 'HyperSpeed Wireless + 3.5mm',
      'Battery Life': '70 hours',
      Features: 'THX Spatial Audio'
    },
    inStock: true,
    stockCount: 89,
    featured: true
  },
  {
    id: 'headset-2',
    name: 'Logitech G Pro X 2 Lightspeed',
    category: 'headsets',
    price: 249.99,
    image: '/products/logitech-g-pro-x-2-lightspeed-gaming-headset-black.png',
    images: ['/products/logitech-g-pro-x-2-lightspeed-gaming-headset-black.png'],
    description: 'Pro-grade wireless gaming headset with 50mm graphene drivers, DTS Headphone:X 2.0, and Blue VO!CE technology.',
    specs: {
      'Driver Size': '50mm Graphene',
      'Frequency Response': '20Hz - 20kHz',
      Impedance: '38 Ohm',
      Microphone: 'Detachable with Blue VO!CE',
      Connectivity: 'LIGHTSPEED + Bluetooth + 3.5mm',
      'Battery Life': '50 hours',
      Features: 'DTS Headphone:X 2.0'
    },
    inStock: true,
    stockCount: 42,
    featured: true
  },
  {
    id: 'headset-3',
    name: 'SteelSeries Arctis Nova Pro Wireless',
    category: 'headsets',
    price: 349.99,
    image: '/products/arctis_nova_pro_wl_black_img.png',
    images: ['products/arctis_nova_pro_wl_black_img.png'],
    description: 'Premium wireless gaming headset with Active Noise Cancellation, Hi-Res Audio, and hot-swappable battery system.',
    specs: {
      'Driver Size': '40mm Neodymium',
      'Frequency Response': '10Hz - 40kHz',
      Impedance: '38 Ohm',
      Microphone: 'ClearCast Gen 2 Retractable',
      Connectivity: 'Quantum 2.0 Wireless + Bluetooth',
      'Battery Life': '44 hours (dual battery)',
      Features: 'Active Noise Cancellation, Hot-swap Battery'
    },
    inStock: true,
    stockCount: 15
  },
  {
    id: 'mousepad-1',
    name: 'SteelSeries QcK Heavy XXL',
    category: 'mousepads',
    price: 39.99,
    image: '/products/steelseries-qck-heavy-xxl.png',
    images: ['/products/steelseries-qck-heavy-xxl.png'],
    description: 'Extra thick QcK micro-woven cloth for maximum comfort and precision tracking on any surface.',
    specs: {
      Size: '900 x 400 x 6mm',
      Surface: 'QcK micro-woven cloth',
      Base: 'Non-slip rubber',
      Features: 'Extra thick, Durable stitched edges'
    },
    inStock: true,
    stockCount: 156
  },
  {
    id: 'mousepad-2',
    name: 'Logitech G840 XL',
    category: 'mousepads',
    price: 49.99,
    image: '/products/logitech-g840-xl.png',
    images: ['/products/logitech-g840-xl.png'],
    description: 'Extra-large gaming mouse pad providing consistent surface texture for both high-DPI and low-DPI tracking movements.',
    specs: {
      Size: '900 x 400 x 3mm',
      Surface: 'Moderate friction cloth',
      Base: 'Natural rubber',
      Features: 'Consistent surface, Flexible material'
    },
    inStock: true,
    stockCount: 234,
    featured: true
  },
  {
    id: 'mousepad-3',
    name: 'Razer Goliathus Extended Chroma',
    category: 'mousepads',
    price: 59.99,
    originalPrice: 79.99,
    discount: 25,
    image: '/products/razer-goliathus-extended-chroma.png',
    images: ['/products/razer-goliathus-extended-chroma.png'],
    description: 'Soft extended gaming mouse mat with Razer Chroma RGB lighting around the edges.',
    specs: {
      Size: '920 x 294 x 3mm',
      Surface: 'Micro-textured cloth',
      Base: 'Non-slip rubber',
      Lighting: 'Razer Chroma RGB',
      Features: 'Multi-lighting zones, Syncs with Razer devices'
    },
    inStock: true,
    stockCount: 67
  },
  {
    id: 'mousepad-4',
    name: 'SteelSeries QcK Prism Cloth XL',
    category: 'mousepads',
    price: 59.99,
    image: '/products/qck-prism_cloth_xl.png',
    images: ['/products/qck-prism_cloth_xl.png'],
    description: '2-zone RGB illumination with 16.8 million colors and dynamic lighting effects.',
    specs: {
      Size: '900 x 300 x 4mm',
      Base: 'Non-slip rubber',
      Surface: 'QcK micro-woven cloth',
      Lighting: '2-zone RGB',
      Features: 'GameSense integration, USB pass-through'
    },
    inStock: true,
    stockCount: 89
  }
]

const users = [
  {
    id: 'admin-1',
    email: 'admin@nexusgear.com',
    name: 'Admin User',
    isAdmin: true,
    password: require('bcryptjs').hashSync('admin123', 10),
    wishlist: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'user-1',
    email: 'user@nexusgear.com',
    name: 'Standard User',
    isAdmin: false,
    password: require('bcryptjs').hashSync('user123', 10),
    wishlist: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
]

const orders = [
  {
    id: 'order-1',
    userId: 'user-1',
    userName: 'Standard User',
    userEmail: 'user@nexusgear.com',
    items: [
      { product: products[0], quantity: 1 }
    ],
    total: products[0].price,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
]

async function clearCollection(name) {
  let snapshot = await db.collection(name).get()

  while (!snapshot.empty) {
    const batch = db.batch()
    snapshot.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()
    snapshot = await db.collection(name).get()
  }
}

async function seedCollection(name, docs) {
  const batch = db.batch()

  docs.forEach((doc) => {
    const ref = db.collection(name).doc(doc.id)
    batch.set(ref, doc, { merge: true })
  })

  await batch.commit()
  console.log(`Seeded ${docs.length} docs into '${name}'`)
}

async function run() {
  try {
    console.log('Clearing collections')
    await clearCollection('products')
    await clearCollection('users')
    await clearCollection('orders')

    console.log('Seeding Firestore database...')
    await seedCollection('products', products)
    await seedCollection('users', users)
    await seedCollection('orders', orders)
    console.log('Seed complete!')
    process.exit(0)
  } catch (error) {
    console.error('Seed error', error)
    process.exit(1)
  }
}

run()
