'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Search, 
  Edit2, 
  Save, 
  X, 
  Percent,
  Package,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useStore, Product } from '@/lib/store'
import { cn } from '@/lib/utils'

export function InventoryTable() {
  const { products, updateProduct } = useStore()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Product>>({})

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase()
    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    )
  })

  const startEditing = (product: Product) => {
    setEditingId(product.id)
    setEditData({
      name: product.name,
      price: product.price,
      stockCount: product.stockCount,
      discount: product.discount || 0
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditData({})
  }

  const saveChanges = async (productId: string) => {
    try {
      await updateProduct(productId, {
        ...editData,
        inStock: (editData.stockCount || 0) > 0,
        originalPrice: editData.discount && editData.discount > 0 
          ? Math.round((editData.price || 0) / (1 - (editData.discount || 0) / 100) * 100) / 100
          : undefined
      })
      setEditingId(null)
      setEditData({})
    } catch (error) {
      console.error('Failed to update product:', error)
      // Could add error toast here
    }
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredProducts.length} products
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Product
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Category
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Price
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Stock
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Discount
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProducts.map((product) => {
              const isEditing = editingId === product.id
              
              return (
                <tr key={product.id} className="hover:bg-secondary/30 transition-colors">
                  {/* Product Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      {isEditing ? (
                        <Input
                          value={editData.name || ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="h-8 bg-secondary border-border max-w-[200px]"
                        />
                      ) : (
                        <span className="font-medium text-foreground">{product.name}</span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground capitalize">
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="relative max-w-[100px]">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.price || ''}
                          onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                          className="h-8 pl-6 bg-secondary border-border"
                        />
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-foreground">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.stockCount || 0}
                        onChange={(e) => setEditData({ ...editData, stockCount: parseInt(e.target.value) })}
                        className="h-8 w-20 bg-secondary border-border"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {product.stockCount === 0 && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                        <span className={cn(
                          "text-sm font-medium",
                          product.stockCount === 0 ? "text-destructive" : 
                          product.stockCount < 20 ? "text-warning" : "text-foreground"
                        )}>
                          {product.stockCount}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Discount */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="relative max-w-[80px]">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editData.discount || 0}
                          onChange={(e) => setEditData({ ...editData, discount: parseInt(e.target.value) })}
                          className="h-8 pr-6 bg-secondary border-border"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    ) : product.discount ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <Percent className="h-3 w-3" />
                        {product.discount}% off
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                      product.inStock
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    )}>
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        product.inStock ? "bg-success" : "bg-destructive"
                      )} />
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditing}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => saveChanges(product.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}
    </Card>
  )
}
