'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-6">
          Your payment was cancelled. Your cart has been saved — you can try again whenever you're ready.
        </p>
        <div className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/checkout">Return to Checkout</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
