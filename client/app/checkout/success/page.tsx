'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId) return

    const confirm = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`http://localhost:8080/api/stripe/confirm/${sessionId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message || 'Could not confirm order')
        }
        setConfirmed(true)
      } catch (err: any) {
        setError(err.message)
        setConfirmed(true) // still show success UI; order will be confirmed eventually
      }
    }

    confirm()
  }, [sessionId])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="p-10 max-w-md w-full text-center">
        {!confirmed ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Confirming your order...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your order. We've received your payment and will start processing your order shortly.
            </p>
            {error && <p className="text-xs text-destructive mb-4">{error}</p>}
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/account">View My Orders</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
