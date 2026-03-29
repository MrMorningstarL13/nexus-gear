import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildApiUrl } from './api-base'

// Types
export type Category = 'mice' | 'keyboards' | 'headsets' | 'mousepads'

export interface Product {
  id: string
  name: string
  category: Category
  price: number
  originalPrice?: number
  discount?: number
  image: string
  images: string[]
  description: string
  specs: Record<string, string>
  inStock: boolean
  stockCount: number
  featured?: boolean
  // For mice recommendations
  handSizes?: ('S' | 'M' | 'L')[]
  gripTypes?: ('Palm' | 'Claw' | 'Tip')[]
  gameGenres?: ('FPS' | 'MOBA')[]
  // For keyboards
  switchType?: 'Red' | 'Blue' | 'Brown'
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

export interface Order {
  id: string
  userId: string
  userName: string
  userEmail: string
  items: CartItem[]
  total: number
  status: 'awaiting_payment' | 'pending' | 'processing' | 'shipped' | 'delivered'
  stripeInvoiceId?: string | null
  stripeHostedInvoiceUrl?: string | null
  stripeInvoicePdfUrl?: string | null
  createdAt: string | { toDate?: () => Date; _seconds?: number; seconds?: number }
}

// Quiz state
export interface QuizState {
  isOpen: boolean
  step: number
  handSize: 'S' | 'M' | 'L' | null
  gripType: 'Palm' | 'Claw' | 'Tip' | null
  gameGenre: 'FPS' | 'MOBA' | null
  recommendations: Product[]
}

// API Functions
const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const token = localStorage.getItem('token')
  const response = await fetch(buildApiUrl(endpoint), {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }
  
  return response.json()
}

export const api = {
  // Products
  getProducts: () => apiRequest('/api/products'),
  updateProduct: (id: string, updates: Partial<Product>) => 
    apiRequest(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  // Orders
  getOrders: () => apiRequest('/api/orders'),
  getMyOrders: () => apiRequest('/api/orders/my'),
  createOrder: (order: Omit<Order, 'id' | 'createdAt'>) => 
    apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  updateOrder: (id: string, updates: Partial<Order>) => 
    apiRequest(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  // Auth
  login: (email: string, password: string) => 
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) => 
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  // Wishlist
  getWishlist: () => apiRequest('/api/wishlist'),
  addToWishlist: (productId: string) => 
    apiRequest('/api/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),
  removeFromWishlist: (productId: string) => 
    apiRequest(`/api/wishlist/remove/${productId}`, {
      method: 'DELETE',
    }),
}

// Store interfaces
interface StoreState {
  // Loading states
  loading: {
    products: boolean
    orders: boolean
    auth: boolean
  }
  
  // Error states
  errors: {
    products: string | null
    orders: string | null
    auth: string | null
  }
  
  // Products
  products: Product[]
  fetchProducts: () => Promise<void>
  setProducts: (products: Product[]) => void
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>
  
  // Cart
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
  getBundleDiscount: () => { discount: number; hasBundle: boolean; bundleCategories: Category[] }

  // Wishlist
  wishlist: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  toggleWishlist: (product: Product) => void
  clearWishlist: () => void
  isInWishlist: (productId: string) => boolean
  
  // Cart drawer
  isCartOpen: boolean
  setCartOpen: (open: boolean) => void
  
  // User
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  
  // Orders
  orders: Order[]
  fetchOrders: () => Promise<void>
  fetchMyOrders: () => Promise<void>
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Promise<Order>
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>
  
  // Quiz
  quiz: QuizState
  openQuiz: () => void
  closeQuiz: () => void
  setQuizStep: (step: number) => void
  setHandSize: (size: 'S' | 'M' | 'L') => void
  setGripType: (type: 'Palm' | 'Claw' | 'Tip') => void
  setGameGenre: (genre: 'FPS' | 'MOBA') => void
  calculateRecommendations: () => void
  resetQuiz: () => void
  
  // Filters
  selectedCategory: Category | 'all'
  setSelectedCategory: (category: Category | 'all') => void
  priceRange: [number, number]
  setPriceRange: (range: [number, number]) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // Initialization
  init: () => void
}



export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Loading states
      loading: {
        products: false,
        orders: false,
        auth: false,
      },
      
      // Error states
      errors: {
        products: null,
        orders: null,
        auth: null,
      },
      
      // Products
      products: [],
      fetchProducts: async () => {
        set((state) => ({ 
          loading: { ...state.loading, products: true },
          errors: { ...state.errors, products: null }
        }))
        try {
          const products = await api.getProducts()
          set({ products })
        } catch (error) {
          set((state) => ({ 
            errors: { ...state.errors, products: error instanceof Error ? error.message : 'Failed to fetch products' }
          }))
        } finally {
          set((state) => ({ loading: { ...state.loading, products: false } }))
        }
      },
      setProducts: (products) => set({ products }),
      updateProduct: async (id, updates) => {
        try {
          await api.updateProduct(id, updates)
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            )
          }))
        } catch (error) {
          set((state) => ({ 
            errors: { ...state.errors, products: error instanceof Error ? error.message : 'Failed to update product' }
          }))
        }
      },
      
      // Cart
      cart: [],
      addToCart: (product, quantity = 1) => set((state) => {
        const existing = state.cart.find((item) => item.product.id === product.id)
        if (existing) {
          return {
            cart: state.cart.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          }
        }
        return { cart: [...state.cart, { product, quantity }] }
      }),

      // Wishlist
      wishlist: [],
      addToWishlist: async (product) => {
        if (get().wishlist.some((item) => item.id === product.id)) return
        try {
          await api.addToWishlist(product.id)
          set((state) => ({ wishlist: [...state.wishlist, product] }))
        } catch (error) {
          console.error('Failed to add to wishlist:', error)
        }
      },
      removeFromWishlist: async (productId) => {
        try {
          await api.removeFromWishlist(productId)
          set((state) => ({ wishlist: state.wishlist.filter((item) => item.id !== productId) }))
        } catch (error) {
          console.error('Failed to remove from wishlist:', error)
        }
      },
      toggleWishlist: async (product) => {
        const isInList = get().wishlist.some((item) => item.id === product.id)
        try {
          if (isInList) {
            await api.removeFromWishlist(product.id)
            set((state) => ({ wishlist: state.wishlist.filter((item) => item.id !== product.id) }))
          } else {
            await api.addToWishlist(product.id)
            set((state) => ({ wishlist: [...state.wishlist, product] }))
          }
        } catch (error) {
          console.error('Failed to toggle wishlist:', error)
        }
      },
      clearWishlist: () => set({ wishlist: [] }),
      isInWishlist: (productId) => {
        const state = get()
        return state.wishlist.some((item) => item.id === productId)
      },
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter((item) => item.product.id !== productId)
      })),
      updateQuantity: (productId, quantity) => set((state) => ({
        cart: quantity <= 0
          ? state.cart.filter((item) => item.product.id !== productId)
          : state.cart.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            )
      })),
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => {
        const state = get()
        const subtotal = state.cart.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        )
        const { discount } = state.getBundleDiscount()
        return subtotal * (1 - discount / 100)
      },
      getCartCount: () => {
        const state = get()
        return state.cart.reduce((sum, item) => sum + item.quantity, 0)
      },
      getBundleDiscount: () => {
        const state = get()
        const cartItems = state.cart.filter(item => {
          // Only include items where product still exists
          return state.products.some(p => p.id === item.product.id)
        })
        const categories = new Set(cartItems.map((item) => item.product.category))
        const bundleCategories: Category[] = ['mice', 'keyboards', 'headsets']
        const matchingCategories = bundleCategories.filter((c) => categories.has(c))
        
        if (matchingCategories.length === 3) {
          return { discount: 15, hasBundle: true, bundleCategories: matchingCategories }
        } else if (matchingCategories.length === 2) {
          return { discount: 5, hasBundle: true, bundleCategories: matchingCategories }
        }
        return { discount: 0, hasBundle: false, bundleCategories: matchingCategories }
      },
      
      // Cart drawer
      isCartOpen: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      
      // User
      user: null,
      login: async (email, password) => {
        set((state) => ({ 
          loading: { ...state.loading, auth: true },
          errors: { ...state.errors, auth: null }
        }))
        try {
          const response = await api.login(email, password)
          const { user, token } = response
          localStorage.setItem('token', token)
          
          // Fetch wishlist from API
          const wishlistData = await api.getWishlist()
          const wishlistIds = wishlistData.wishlist || []
          // Map IDs to products
          const products = get().products
          const wishlist = products.filter(p => wishlistIds.includes(p.id))
          
          set({ user, wishlist })
        } catch (error) {
          set((state) => ({ 
            errors: { ...state.errors, auth: error instanceof Error ? error.message : 'Login failed' }
          }))
          throw error
        } finally {
          set((state) => ({ loading: { ...state.loading, auth: false } }))
        }
      },
      register: async (name, email, password) => {
        set((state) => ({ 
          loading: { ...state.loading, auth: true },
          errors: { ...state.errors, auth: null }
        }))
        try {
          const response = await api.register(name, email, password)
          const { user, token } = response
          localStorage.setItem('token', token)
          // New user starts with empty wishlist
          set({ user, wishlist: [] })
        } catch (error) {
          set((state) => ({ 
            errors: { ...state.errors, auth: error instanceof Error ? error.message : 'Registration failed' }
          }))
          throw error
        } finally {
          set((state) => ({ loading: { ...state.loading, auth: false } }))
        }
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, wishlist: [] })
      },
      setUser: (user) => set({ user }),
      
      // Orders
      orders: [],
      fetchOrders: async () => {
        set((state) => ({ 
          loading: { ...state.loading, orders: true },
          errors: { ...state.errors, orders: null }
        }))
        try {
          const orders = await api.getOrders()
          set({ orders })
        } catch (error) {
          set((state) => ({ 
            errors: { ...state.errors, orders: error instanceof Error ? error.message : 'Failed to fetch orders' }
          }))
        } finally {
          set((state) => ({ loading: { ...state.loading, orders: false } }))
        }
      },
      fetchMyOrders: async () => {
        set((state) => ({
          loading: { ...state.loading, orders: true },
          errors: { ...state.errors, orders: null }
        }))
        try {
          const orders = await api.getMyOrders()
          set({ orders })
        } catch (error) {
          set((state) => ({
            errors: { ...state.errors, orders: error instanceof Error ? error.message : 'Failed to fetch orders' }
          }))
        } finally {
          set((state) => ({ loading: { ...state.loading, orders: false } }))
        }
      },
      createOrder: async (orderData) => {
        try {
          const newOrder = await api.createOrder(orderData)
          set((state) => ({
            orders: [newOrder, ...state.orders]
          }))
          return newOrder
        } catch (error) {
          set((state) => ({ 
            errors: { ...state.errors, orders: error instanceof Error ? error.message : 'Failed to create order' }
          }))
          throw error
        }
      },
      updateOrderStatus: async (orderId, status) => {
        try {
          await api.updateOrder(orderId, { status })
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId ? { ...o, status } : o
            )
          }))
        } catch (error) {
          set((state) => ({ 
            errors: { ...state.errors, orders: error instanceof Error ? error.message : 'Failed to update order' }
          }))
        }
      },
      
      // Quiz
      quiz: {
        isOpen: false,
        step: 1,
        handSize: null,
        gripType: null,
        gameGenre: null,
        recommendations: []
      },
      openQuiz: () => set((state) => ({
        quiz: { ...state.quiz, isOpen: true, step: 1 }
      })),
      closeQuiz: () => set((state) => ({
        quiz: { ...state.quiz, isOpen: false }
      })),
      setQuizStep: (step) => set((state) => ({
        quiz: { ...state.quiz, step }
      })),
      setHandSize: (size) => set((state) => ({
        quiz: { ...state.quiz, handSize: size }
      })),
      setGripType: (type) => set((state) => ({
        quiz: { ...state.quiz, gripType: type }
      })),
      setGameGenre: (genre) => set((state) => ({
        quiz: { ...state.quiz, gameGenre: genre }
      })),
      calculateRecommendations: () => {
        const state = get()
        const { handSize, gripType, gameGenre } = state.quiz
        
        const mice = state.products.filter((p) => p.category === 'mice')
        
        // Score each mouse based on matches
        const scored = mice.map((mouse) => {
          let score = 0
          if (handSize && mouse.handSizes?.includes(handSize)) score += 3
          if (gripType && mouse.gripTypes?.includes(gripType)) score += 3
          if (gameGenre && mouse.gameGenres?.includes(gameGenre)) score += 2
          return { mouse, score }
        })
        
        // Sort by score and take top 3
        const recommendations = scored
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((s) => s.mouse)
        
        set((state) => ({
          quiz: { ...state.quiz, recommendations, step: 4 }
        }))
      },
      resetQuiz: () => set((state) => ({
        quiz: {
          isOpen: false,
          step: 1,
          handSize: null,
          gripType: null,
          gameGenre: null,
          recommendations: []
        }
      })),
      
      // Filters
      selectedCategory: 'all',
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      priceRange: [0, 300],
      setPriceRange: (range) => set({ priceRange: range }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // Initialization
      init: () => {
        const state = get()
        if (state.products.length === 0) {
          state.fetchProducts()
        }
        if (state.user?.isAdmin && state.orders.length === 0) {
          state.fetchOrders()
        }
      }
    }),
    {
      name: 'nexus-gear-store',
      version: 4, // Increment to clear old cached data and reset wishlists
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        // Don't persist wishlist globally anymore - it's user-scoped
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<StoreState>
        return {
          ...currentState,
          user: persisted.user ?? currentState.user,
          cart: (persisted.cart || []).filter(item => {
            // Only keep cart items for products that still exist
            return currentState.products.some(p => p.id === item.product.id)
          }),
          // Wishlists are now per-user and cleared on logout/login
          wishlist: []
        }
      }
    }
  )
)
