'use client'

import { use, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Check, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { BundleProgress } from '@/components/bundle-progress'
import { GripQuiz } from '@/components/grip-quiz'
import { SwitchSoundboard } from '@/components/switch-soundboard'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { products, addToCart, setCartOpen } = useStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const product = useMemo(() => products.find((p) => p.id === id), [products, id])

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Product not found</h1>
            <Button onClick={() => router.push('/')}>Back to Shop</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setCartOpen(true)
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link 
              href="/" 
              onClick={() => useStore.getState().setSelectedCategory(product.category)}
              className="hover:text-primary transition-colors capitalize"
            >
              {product.category}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.name}</span>
          </nav>

          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Product Details */}
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl bg-card border border-border overflow-hidden">
                {product.discount && (
                  <div className="absolute top-4 left-4 z-10 rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">
                    -{product.discount}% OFF
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="relative h-full w-full">
                    <Image
                      src={product.images[selectedImage] || product.image}
                      alt={product.name}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "relative h-20 w-20 flex-shrink-0 rounded-lg border overflow-hidden transition-all",
                        selectedImage === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              {/* Category & Name */}
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-primary mb-2">
                  {product.category}
                </p>
                <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
                  {product.name}
                </h1>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  €{product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      €{product.originalPrice.toFixed(2)}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                      Save €{(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-3 w-3 rounded-full",
                  product.inStock ? "bg-success" : "bg-destructive"
                )} />
                <span className={cn(
                  "font-medium",
                  product.inStock ? "text-success" : "text-destructive"
                )}>
                  {product.inStock ? `In Stock (${product.stockCount} available)` : 'Out of Stock'}
                </span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Quantity & Add to Cart */}
              {product.inStock && (
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex items-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                      disabled={quantity >= product.stockCount}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    className="flex-1 gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </Button>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-secondary/50">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-secondary/50">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">2-Year Warranty</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-secondary/50">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">30-Day Returns</span>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Technical Specifications</h2>
                <div className="rounded-lg border border-border overflow-hidden">
                  {Object.entries(product.specs).map(([key, value], index) => (
                    <div
                      key={key}
                      className={cn(
                        "flex justify-between px-4 py-3",
                        index % 2 === 0 ? "bg-card" : "bg-secondary/30"
                      )}
                    >
                      <span className="text-sm text-muted-foreground">{key}</span>
                      <span className="text-sm font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Switch Soundboard for Keyboards */}
              {product.category === 'keyboards' && (
                <SwitchSoundboard currentSwitch={product.switchType} />
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-6">Related Products</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map((related) => (
                  <Link key={related.id} href={`/product/${related.id}`}>
                    <Card className="group overflow-hidden bg-card border-border/50 hover:border-primary/50 transition-all">
                      <div className="relative aspect-square bg-secondary/50 p-6">
                        <Image
                          src={related.image}
                          alt={related.name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {related.name}
                        </h3>
                        <p className="text-lg font-bold text-foreground mt-1">
                          ${related.price.toFixed(2)}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <BundleProgress />
      <GripQuiz />
    </div>
  )
}
