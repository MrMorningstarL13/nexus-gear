'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Calendar, LogOut, ShoppingBag, Heart, Settings, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useStore } from '@/lib/store'
import { buildApiUrl } from '@/lib/api-base'

export default function AccountPage() {
  const router = useRouter()
  const { user, logout, orders, fetchMyOrders, wishlist, toggleWishlist, addToCart } = useStore()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchMyOrders()
  }, [user])

  if (!user) return null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const getOrderTime = (value: unknown) => {
    if (value && typeof value === 'object' && 'toDate' in (value as Record<string, unknown>)) {
      const maybeToDate = (value as { toDate?: () => Date }).toDate
      if (typeof maybeToDate === 'function') {
        return maybeToDate().getTime()
      }
    }
    if (value && typeof value === 'object') {
      const raw = value as { _seconds?: number; seconds?: number }
      const seconds = typeof raw._seconds === 'number' ? raw._seconds : raw.seconds
      if (typeof seconds === 'number') {
        return seconds * 1000
      }
    }
    if (typeof value === 'string' || value instanceof Date) {
      const time = new Date(value).getTime()
      if (!Number.isNaN(time)) return time
    }
    return 0
  }

  const visibleOrders = [...orders]
    .filter((order) => order.status !== 'awaiting_payment')
    .sort((a, b) => getOrderTime(b.createdAt) - getOrderTime(a.createdAt))

  const formatDate = (value: unknown) => {
    if (value && typeof value === 'object' && 'toDate' in (value as Record<string, unknown>)) {
      const maybeToDate = (value as { toDate?: () => Date }).toDate
      if (typeof maybeToDate === 'function') {
        return maybeToDate().toLocaleDateString()
      }
    }
    if (value && typeof value === 'object') {
      const raw = value as { _seconds?: number; seconds?: number }
      const seconds = typeof raw._seconds === 'number' ? raw._seconds : raw.seconds
      if (typeof seconds === 'number') {
        return new Date(seconds * 1000).toLocaleDateString()
      }
    }
    if (typeof value === 'string' || value instanceof Date) {
      const date = new Date(value)
      if (!Number.isNaN(date.getTime())) return date.toLocaleDateString()
    }
    return new Date().toLocaleDateString()
  }

  const openInvoice = async (orderId: string, opts?: { hostedUrl?: string | null; pdfUrl?: string | null }) => {
    const stripeTargetUrl = opts?.hostedUrl || opts?.pdfUrl
    if (stripeTargetUrl) {
      const anchor = document.createElement('a')
      anchor.href = stripeTargetUrl
      anchor.target = '_blank'
      anchor.rel = 'noopener noreferrer'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      return
    }

    try {
      const token = localStorage.getItem('token')
      const invoiceParams = 'disposition=inline'

      // Ask API for Stripe invoice URL in JSON form to avoid cross-origin fetch redirects.
      const resolveRes = await fetch(buildApiUrl(`/api/orders/${orderId}/invoice?${invoiceParams}&response=json`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!resolveRes.ok) {
        const body = await resolveRes.json().catch(() => ({} as { message?: string }))
        throw new Error(body.message || 'Stripe invoice is not available yet')
      }

      const resolved = await resolveRes.json().catch(() => ({} as { url?: string | null; message?: string }))
      if (!resolved?.url) {
        throw new Error(resolved?.message || 'Stripe invoice is not available yet')
      }

      const link = document.createElement('a')
      link.href = resolved.url
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Invoice error:', error)
      alert(error instanceof Error ? error.message : 'Could not open invoice')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">My Account</h1>
            <p className="text-muted-foreground text-lg">
              Manage your account settings and view your order history
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
                    <p className="text-muted-foreground">{user.isAdmin ? 'Administrator' : 'Customer'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Member since {formatDate((user as { createdAt?: unknown }).createdAt)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full mt-6 gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </Card>
            </div>

            {/* Account Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link href="/find-mouse">
                    <Button variant="outline" className="w-full gap-2 justify-start">
                      <Settings className="h-4 w-4" />
                      Find My Perfect Mouse
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full gap-2 justify-start" disabled>
                    <Heart className="h-4 w-4" />
                    Wishlist (Coming Soon)
                  </Button>
                </div>
              </Card>

              {/* Wishlist */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Wishlist</h3>
                  <Button variant="outline" size="sm" onClick={() => wishlist.length && useStore.getState().clearWishlist()}>
                    Clear
                  </Button>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Your wishlist is empty. Add products from the catalog.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {wishlist.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">€{product.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => addToCart(product)}>
                            Add to Cart
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleWishlist(product)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Order History */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Order History</h3>
                </div>

                {visibleOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-foreground mb-2">No orders yet</h4>
                    <p className="text-muted-foreground mb-4">
                      Start shopping to see your order history here
                    </p>
                    <Link href="/">
                      <Button>Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visibleOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">
                            Order #{order.id.slice(-8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            €{order.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {order.status || 'Processing'}
                          </p>
                          <div className="mt-2 flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1"
                              onClick={() => openInvoice(order.id, {
                                hostedUrl: order.stripeHostedInvoiceUrl,
                                pdfUrl: order.stripeInvoicePdfUrl,
                              })}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              View Invoice
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}