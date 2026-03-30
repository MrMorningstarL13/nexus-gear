'use client'

import { useState } from 'react'
import { 
  Search, 
  ChevronDown,
  Package,
  Truck,
  CheckCircle,
  Clock,
  CreditCard,
  Mail,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useStore, Order } from '@/lib/store'
import { cn } from '@/lib/utils'

const statusConfig = {
  awaiting_payment: {
    label: 'Awaiting Payment',
    icon: CreditCard,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-warning',
    bg: 'bg-warning/10'
  },
  processing: {
    label: 'Processing',
    icon: Package,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    color: 'text-primary',
    bg: 'bg-primary/10'
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'text-success',
    bg: 'bg-success/10'
  }
}

const defaultStatusConfig = {
  label: 'Pending',
  icon: Clock,
  color: 'text-warning',
  bg: 'bg-warning/10'
}

export function OrdersTable() {
  const { orders, updateOrderStatus } = useStore()
  const [search, setSearch] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const filteredOrders = orders.filter((order) => {
    const query = search.toLowerCase()
    return (
      order.id.toLowerCase().includes(query) ||
      order.userName.toLowerCase().includes(query) ||
      order.userEmail.toLowerCase().includes(query)
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const cycleStatus = async (order: Order) => {
    if (order.status === 'delivered') {
      return
    }

    const statuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered']
    const currentIndex = statuses.indexOf(order.status)
    const nextStatus = statuses[(currentIndex + 1) % statuses.length]
    try {
      await updateOrderStatus(order.id, nextStatus)
    } catch (error) {
      console.error('Failed to update order status:', error)
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
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredOrders.length} orders
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-border">
        {filteredOrders.map((order) => {
          const status = statusConfig[order.status as keyof typeof statusConfig] || defaultStatusConfig
          const StatusIcon = status.icon
          const isExpanded = expandedOrder === order.id

          return (
            <div key={order.id} className="hover:bg-secondary/30 transition-colors">
              {/* Order Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    status.bg
                  )}>
                    <StatusIcon className={cn("h-5 w-5", status.color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {order.id}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        status.bg,
                        status.color
                      )}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{order.userName}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ${order.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    isExpanded && "rotate-180"
                  )} />
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0">
                  <div className="rounded-lg bg-secondary/50 p-4 space-y-4">
                    {/* Customer Info */}
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-foreground">{order.userEmail}</span>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">Order Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div 
                            key={item.product.id}
                            className="flex items-center justify-between py-2 border-b border-border last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-foreground">
                                {item.product.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                x{item.quantity}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={order.status === 'delivered'}
                        onClick={(e) => {
                          e.stopPropagation()
                          cycleStatus(order)
                        }}
                        className="gap-2"
                      >
                        <StatusIcon className="h-4 w-4" />
                        {order.status === 'delivered' ? 'Final Status' : 'Update Status'}
                      </Button>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-bold text-foreground">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}
    </Card>
  )
}
