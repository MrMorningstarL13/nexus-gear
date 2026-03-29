'use client'

import { useMemo } from 'react'
import { Mouse, Keyboard, Headphones, Gift, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore, Category } from '@/lib/store'
import { cn } from '@/lib/utils'

const bundleItems: { category: Category; icon: React.ReactNode; name: string }[] = [
  { category: 'mice', icon: <Mouse className="h-4 w-4" />, name: 'Mouse' },
  { category: 'keyboards', icon: <Keyboard className="h-4 w-4" />, name: 'Keyboard' },
  { category: 'headsets', icon: <Headphones className="h-4 w-4" />, name: 'Headset' },
]

export function BundleProgress() {
  const { cart, getBundleDiscount, setCartOpen } = useStore()

  const cartCategories = useMemo(() => {
    return new Set(cart.map((item) => item.product.category))
  }, [cart])

  const { discount, hasBundle, bundleCategories } = getBundleDiscount()

  // Calculate progress
  const matchedCount = bundleItems.filter((item) => cartCategories.has(item.category)).length
  const progress = (matchedCount / 3) * 100

  // Don't show if cart is empty or has all items
  if (cart.length === 0) return null

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm",
      "transform transition-transform duration-300",
      matchedCount === 0 ? "translate-y-full" : "translate-y-0"
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Progress Section */}
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Gift className={cn(
                "h-5 w-5 transition-colors",
                matchedCount === 3 ? "text-primary" : "text-muted-foreground"
              )} />
              <span className="text-sm font-medium text-foreground">
                Elite Gaming Bundle
              </span>
            </div>

            {/* Item Indicators */}
            <div className="flex items-center gap-2">
              {bundleItems.map((item) => {
                const hasItem = cartCategories.has(item.category)
                return (
                  <div
                    key={item.category}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                      hasItem
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.name}</span>
                  </div>
                )
              })}
            </div>

            {/* Progress Bar */}
            <div className="hidden md:flex flex-1 max-w-xs items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {matchedCount}/3
              </span>
            </div>
          </div>

          {/* Discount Section */}
          <div className="flex items-center gap-3">
            {matchedCount < 3 ? (
              <p className="text-sm text-muted-foreground">
                {matchedCount === 0 && "Add a mouse, keyboard, or headset to start your bundle!"}
                {matchedCount === 1 && "Add 2 more items for 15% off!"}
                {matchedCount === 2 && (
                  <>
                    <span className="text-primary font-medium">5% off</span>
                    {" "}applied! Add 1 more for <span className="text-primary font-medium">15% off!</span>
                  </>
                )}
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary">
                  15% Bundle Discount Active!
                </span>
                <Button
                  size="sm"
                  onClick={() => setCartOpen(true)}
                  className="gap-1"
                >
                  <Gift className="h-4 w-4" />
                  Claim Bundle
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
