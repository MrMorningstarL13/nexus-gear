import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { ProductGrid } from '@/components/product-grid'
import { CartDrawer } from '@/components/cart-drawer'
import { BundleProgress } from '@/components/bundle-progress'
import { GripQuiz } from '@/components/grip-quiz'
import { Footer } from '@/components/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <section id="products" className="container mx-auto px-4 py-12">
          <ProductGrid />
        </section>
      </main>
      <Footer />
      <CartDrawer />
      <BundleProgress />
      <GripQuiz />
    </div>
  )
}
