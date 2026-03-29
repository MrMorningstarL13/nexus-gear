'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setCartOpen, 
    removeFromCart, 
    updateQuantity,
    getCartTotal,
    getBundleDiscount,
    user
  } = useStore()

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }, [cart])

  const { discount, hasBundle, bundleCategories } = getBundleDiscount()
  const total = getCartTotal()
  const savings = subtotal - total

  if (!isCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border bg-background shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Your Cart</h2>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary">
                {cart.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                  Add some gaming gear to get started
                </p>
                <Button onClick={() => setCartOpen(false)} className="gap-2">
                  Continue Shopping
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4 p-4">
                    {/* Image */}
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-lg bg-secondary overflow-hidden">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/product/${item.product.id}`}
                        onClick={() => setCartOpen(false)}
                        className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground capitalize">
                        {item.product.category}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stockCount}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-foreground">
                            €{(item.product.price * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-border p-6 space-y-4">
              {/* Bundle Discount */}
              {hasBundle && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Bundle Discount: {discount}% off!
                  </span>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">€{subtotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-primary">Bundle Savings</span>
                    <span className="text-primary">-€{savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">€{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button className="w-full gap-2" size="lg" asChild>
                <Link href={user ? "/checkout" : "/login"} onClick={() => setCartOpen(false)}>
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Free shipping on orders over €99
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
