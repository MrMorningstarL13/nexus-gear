'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye, Zap, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Product, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, setCartOpen, toggleWishlist, isInWishlist } = useStore()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    setCartOpen(true)
  }

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group relative overflow-hidden bg-card border-border/50 hover:border-primary/50 transition-all duration-300">
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
            <Zap className="h-3 w-3" />
            -{product.discount}%
          </div>
        )}

        {/* Stock Badge */}
        {!product.inStock && (
          <div className="absolute top-3 right-3 z-10 rounded-full bg-destructive/90 px-2.5 py-1 text-xs font-medium text-destructive-foreground">
            Out of Stock
          </div>
        )}

        {/* Wishlist */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleWishlist(product)
          }}
          className="absolute top-3 left-3 z-20 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-primary transition-colors"
        >
          {isInWishlist(product.id) ? <Heart className="h-4 w-4 text-primary" /> : <Heart className="h-4 w-4" />}
        </button>

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-secondary/50">
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative h-full w-full">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          </div>
          
          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              size="sm"
              variant="secondary"
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            {product.inStock && (
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Add
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">
            {product.category}
          </p>

          {/* Name */}
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          {/* Price */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">
              €{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                €{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-2 flex items-center gap-1.5">
            <div className={cn(
              "h-2 w-2 rounded-full",
              product.inStock ? "bg-success" : "bg-destructive"
            )} />
            <span className={cn(
              "text-xs",
              product.inStock ? "text-success" : "text-destructive"
            )}>
              {product.inStock ? `${product.stockCount} in stock` : 'Out of Stock'}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
