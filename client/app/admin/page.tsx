'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Gamepad2, 
  Package, 
  ClipboardList, 
  LogOut, 
  Home,
  DollarSign,
  TrendingUp,
  Users,
  ShoppingCart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { InventoryTable } from '@/components/admin/inventory-table'
import { OrdersTable } from '@/components/admin/orders-table'
import { cn } from '@/lib/utils'

type Tab = 'inventory' | 'orders'

export default function AdminPage() {
  const router = useRouter()
  const { user, setUser, products, orders, fetchOrders } = useStore()
  const [activeTab, setActiveTab] = useState<Tab>('inventory')

  useEffect(() => {
    // Redirect if not admin
    if (!user?.isAdmin) {
      router.push('/login')
    } else {
      // Fetch orders when admin loads
      fetchOrders()
    }
  }, [user, router, fetchOrders])

  const handleLogout = () => {
    setUser(null)
    router.push('/')
  }

  if (!user?.isAdmin) {
    return null
  }

  // Calculate stats
  const totalProducts = products.length
  const totalStock = products.reduce((sum, p) => sum + p.stockCount, 0)
  const outOfStock = products.filter((p) => !p.inStock).length
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Gamepad2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  NEXUS<span className="text-primary">GEAR</span>
                </span>
              </Link>
              <span className="hidden sm:block text-sm text-muted-foreground border-l border-border pl-4">
                Admin Dashboard
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Store</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {"Here's what's happening with your store today."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold text-foreground">{totalStock}</p>
                {outOfStock > 0 && (
                  <p className="text-xs text-destructive">{outOfStock} out of stock</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <ShoppingCart className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                {pendingOrders > 0 && (
                  <p className="text-xs text-warning">{pendingOrders} pending</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold text-foreground">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('inventory')}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === 'inventory'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Package className="h-4 w-4" />
            Inventory Management
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === 'orders'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <ClipboardList className="h-4 w-4" />
            Order Tracking
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'inventory' && <InventoryTable />}
        {activeTab === 'orders' && <OrdersTable />}
      </main>
    </div>
  )
}
