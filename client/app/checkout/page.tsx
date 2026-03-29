"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function CheckoutPage() {
  const { cart, getCartTotal, getBundleDiscount, user, clearCart } = useStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const { discount } = getBundleDiscount();
  const total = getCartTotal();

  const handleCheckout = async () => {
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          cart,
          email: user?.email || '',
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to create Stripe session');
      }
      const { url } = await res.json();
      clearCart();
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl space-y-8">
        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-6">Order Summary</h1>
          {cart.length === 0 ? (
            <Alert variant="destructive">Your cart is empty.</Alert>
          ) : (
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-lg bg-secondary overflow-hidden">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.product.name}</div>
                    <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-semibold flex-shrink-0">€{(item.product.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              <div className="space-y-2 border-t border-border pt-4 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Full Price</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Bundle Discount ({discount}%)</span>
                    <span>-€{(subtotal - total).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Final Price</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
              {error && <Alert variant="destructive">{error}</Alert>}
              <Button className="w-full" size="lg" disabled={loading} onClick={handleCheckout}>
                {loading ? 'Redirecting to Stripe...' : 'Proceed to Payment'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
