'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Search,
  Mouse,
  Keyboard,
  Headphones,
  Square,
  Gamepad2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore, Category } from '@/lib/store'
import { cn } from '@/lib/utils'

const categories: { name: string; value: Category | 'all'; icon: React.ReactNode }[] = [
  { name: 'All Products', value: 'all', icon: <Gamepad2 className="h-4 w-4" /> },
  { name: 'Mice', value: 'mice', icon: <Mouse className="h-4 w-4" /> },
  { name: 'Keyboards', value: 'keyboards', icon: <Keyboard className="h-4 w-4" /> },
  { name: 'Headsets', value: 'headsets', icon: <Headphones className="h-4 w-4" /> },
  { name: 'Mousepads', value: 'mousepads', icon: <Square className="h-4 w-4" /> },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  
  const { 
    cart, 
    setCartOpen, 
    user, 
    selectedCategory, 
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    getCartCount
  } = useStore()

  const cartCount = getCartCount()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              NEXUS<span className="text-primary">GEAR</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {categories.map((category) => (
              <Link
                key={category.value}
                href="/"
                onClick={(e) => {
                  if (pathname === '/') {
                    e.preventDefault()
                  }
                  setSelectedCategory(category.value)
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  selectedCategory === category.value
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {category.icon}
                {category.name}
              </Link>
            ))}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className={cn(
              "transition-all duration-200 overflow-hidden",
              searchOpen ? "w-48 md:w-64" : "w-0"
            )}>
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 bg-secondary border-border"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(true)}
              className="relative text-muted-foreground hover:text-foreground"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* User */}
            <Link href={user ? (user.isAdmin ? '/admin' : '/account') : '/login'}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "hover:text-foreground",
                  (pathname === '/account' || pathname === '/admin')
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                )}
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4">
            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <Link
                  key={category.value}
                  href="/"
                  onClick={(e) => {
                    if (pathname === '/') {
                      e.preventDefault()
                    }
                    setSelectedCategory(category.value)
                    setMobileMenuOpen(false)
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                    selectedCategory === category.value
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {category.icon}
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
