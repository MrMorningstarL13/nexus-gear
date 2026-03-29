'use client'

import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import { ProductCard } from './product-card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

export function ProductGrid() {
  const { 
    products, 
    loading,
    errors,
    selectedCategory, 
    priceRange, 
    setPriceRange,
    searchQuery 
  } = useStore()
  
  const [showFilters, setShowFilters] = useState(false)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false
      }

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [products, selectedCategory, priceRange, searchQuery])

  if (loading.products) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  if (errors.products) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-destructive mb-4">Failed to load products</div>
          <p className="text-muted-foreground mb-4">{errors.products}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const featuredProducts = filteredProducts.filter((p) => p.featured)
  const regularProducts = filteredProducts.filter((p) => !p.featured)

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {selectedCategory === 'all' ? 'All Products' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          {showFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-md">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={0}
                max={300}
                step={10}
                className="w-full"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPriceRange([0, 300])}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && selectedCategory === 'all' && (
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Featured Products
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* All Products */}
      <section>
        {featuredProducts.length > 0 && selectedCategory === 'all' && (
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            All Products
          </h3>
        )}
        {regularProducts.length > 0 || (featuredProducts.length > 0 && selectedCategory !== 'all') ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(selectedCategory === 'all' ? regularProducts : filteredProducts).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No products found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : null}
      </section>
    </div>
  )
}
