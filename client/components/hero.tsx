'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react'

export function Hero() {

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, currentColor 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              Premium Gaming Peripherals
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Elevate Your
              <span className="block text-primary">Gaming Experience</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Discover precision-engineered gaming gear designed for competitive players. 
              From ultra-responsive mice to mechanical keyboards with perfect switches.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row relative z-10">
              <Button size="lg" className="gap-2" asChild>
                <a href="#products">
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link href="/find-mouse">
                  Find Your Perfect Mouse
                </Link>
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over €99</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">2-Year Warranty</p>
                <p className="text-xs text-muted-foreground">Full coverage</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">Bundle Deals</p>
                <p className="text-xs text-muted-foreground">Save up to 15%</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative lg:h-[500px]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
            <div className="relative h-full flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 p-8">
                {/* Product Preview Cards */}
                <div className="space-y-4">
                  <div className="rounded-xl bg-card border border-border p-4 transform rotate-3 hover:rotate-0 transition-transform">
                    <div className="aspect-square rounded-lg bg-secondary/50 mb-3 flex items-center justify-center">
                      <span className="text-4xl">🖱️</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">Gaming Mice</p>
                    <p className="text-xs text-muted-foreground">From €69.99</p>
                  </div>
                  <div className="rounded-xl bg-card border border-border p-4 transform -rotate-2 hover:rotate-0 transition-transform">
                    <div className="aspect-square rounded-lg bg-secondary/50 mb-3 flex items-center justify-center">
                      <span className="text-4xl">🎧</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">Headsets</p>
                    <p className="text-xs text-muted-foreground">From €99.99</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="rounded-xl bg-card border border-border p-4 transform -rotate-3 hover:rotate-0 transition-transform">
                    <div className="aspect-square rounded-lg bg-secondary/50 mb-3 flex items-center justify-center">
                      <span className="text-4xl">⌨️</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">Keyboards</p>
                    <p className="text-xs text-muted-foreground">From €129.99</p>
                  </div>
                  <div className="rounded-xl bg-card border border-border p-4 transform rotate-2 hover:rotate-0 transition-transform">
                    <div className="aspect-square rounded-lg bg-secondary/50 mb-3 flex items-center justify-center">
                      <span className="text-4xl">🖼️</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">Mousepads</p>
                    <p className="text-xs text-muted-foreground">From €29.99</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
