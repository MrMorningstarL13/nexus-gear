'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Hand, Crosshair, Gamepad2, ShoppingCart, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface QuizOption {
  value: string
  label: string
  description: string
  icon?: React.ReactNode
}

const handSizeOptions: QuizOption[] = [
  { value: 'S', label: 'Small', description: 'Hand length < 17cm', icon: <span className="text-4xl">🤏</span> },
  { value: 'M', label: 'Medium', description: 'Hand length 17-19cm', icon: <span className="text-4xl">✋</span> },
  { value: 'L', label: 'Large', description: 'Hand length > 19cm', icon: <span className="text-4xl">🖐️</span> },
]

const gripTypeOptions: QuizOption[] = [
  { 
    value: 'Palm', 
    label: 'Palm Grip', 
    description: 'Full hand contact with the mouse - comfortable for extended sessions',
    icon: <Hand className="h-10 w-10" />
  },
  { 
    value: 'Claw', 
    label: 'Claw Grip', 
    description: 'Fingertips bent at 90 degrees - balanced control and speed',
    icon: <span className="text-4xl">🦀</span>
  },
  { 
    value: 'Tip', 
    label: 'Fingertip Grip', 
    description: 'Only fingertips touch the mouse - maximum precision and speed',
    icon: <span className="text-4xl">👆</span>
  },
]

const gameGenreOptions: QuizOption[] = [
  { 
    value: 'FPS', 
    label: 'FPS / Shooters', 
    description: 'CS2, Valorant, Call of Duty, Apex Legends - needs fast, responsive mice',
    icon: <Crosshair className="h-10 w-10" />
  },
  { 
    value: 'MOBA', 
    label: 'MOBA / Strategy', 
    description: 'League of Legends, Dota 2, Starcraft - needs precise positioning',
    icon: <Gamepad2 className="h-10 w-10" />
  },
]

export default function FindMousePage() {
  const { 
    products,
    addToCart,
    setCartOpen
  } = useStore()

  const [step, setStep] = useState(1)
  const [handSize, setHandSize] = useState<string | null>(null)
  const [gripType, setGripType] = useState<string | null>(null)
  const [gameGenre, setGameGenre] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleNext = () => {
    if (step === 3) {
      calculateRecommendations()
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const canProceed = useMemo(() => {
    if (step === 1) return handSize !== null
    if (step === 2) return gripType !== null
    if (step === 3) return gameGenre !== null
    return true
  }, [step, handSize, gripType, gameGenre])

  const calculateRecommendations = () => {
    const filtered = products.filter(
      (p) =>
        p.category === 'mice' &&
        p.handSizes?.includes(handSize!) &&
        p.gripTypes?.includes(gripType!) &&
        p.gameGenres?.includes(gameGenre!)
    )
    setRecommendations(filtered.length > 0 ? filtered : products.filter((p) => p.category === 'mice').slice(0, 3))
    setShowResults(true)
  }

  const handleReset = () => {
    setStep(1)
    setHandSize(null)
    setGripType(null)
    setGameGenre(null)
    setRecommendations([])
    setShowResults(false)
  }

  const handleAddToCart = (product: any) => {
    addToCart(product)
    setCartOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="ghost" size="sm" className="gap-2 mb-4" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Shop
              </Link>
            </Button>
            <h1 className="text-4xl font-bold text-foreground mb-2">Find Your Perfect Mouse</h1>
            <p className="text-muted-foreground text-lg">
              Answer a few questions to get personalized mouse recommendations based on your preferences
            </p>
          </div>

          {!showResults ? (
            <div className="max-w-2xl">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Question {step} of 3</span>
                  <span className="text-sm font-medium text-foreground">{Math.round((step / 3) * 100)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* Questions */}
              <Card className="p-8 border border-border">
                {/* Step 1: Hand Size */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">What's your hand size?</h2>
                      <p className="text-muted-foreground">
                        Measure your hand from wrist to the tip of your middle finger
                      </p>
                    </div>
                    <div className="grid gap-4">
                      {handSizeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setHandSize(option.value)}
                          className={cn(
                            "p-6 rounded-lg border-2 transition-all text-left",
                            handSize === option.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 bg-card"
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div>{option.icon}</div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground text-lg">{option.label}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Grip Type */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">What's your grip style?</h2>
                      <p className="text-muted-foreground">
                        Choose the grip that feels most natural to you
                      </p>
                    </div>
                    <div className="grid gap-4">
                      {gripTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setGripType(option.value)}
                          className={cn(
                            "p-6 rounded-lg border-2 transition-all text-left",
                            gripType === option.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 bg-card"
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-primary">{option.icon}</div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground text-lg">{option.label}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Game Genre */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">What games do you play?</h2>
                      <p className="text-muted-foreground">
                        Different genres benefit from different mouse characteristics
                      </p>
                    </div>
                    <div className="grid gap-4">
                      {gameGenreOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setGameGenre(option.value)}
                          className={cn(
                            "p-6 rounded-lg border-2 transition-all text-left",
                            gameGenre === option.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 bg-card"
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-primary">{option.icon}</div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground text-lg">{option.label}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === 1}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className="gap-2"
                  >
                    {step === 3 ? 'See Recommendations' : 'Next'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Results Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Your Perfect Match</h2>
                    <p className="text-muted-foreground">
                      Based on your preferences: <span className="text-primary font-medium">{handSize}</span> hand,{' '}
                      <span className="text-primary font-medium">{gripType}</span> grip, and{' '}
                      <span className="text-primary font-medium">{gameGenre}</span> games
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Retake Quiz
                  </Button>
                </div>
              </div>

              {/* Recommendations Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((product) => (
                  <Card
                    key={product.id}
                    className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-secondary/50">
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="relative h-full w-full">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                      {product.discount && (
                        <div className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                          -{product.discount}%
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">
                          {product.category}
                        </p>
                        <h3 className="font-semibold text-foreground">{product.name}</h3>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">
                          €{product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            €{product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          product.inStock ? "bg-success" : "bg-destructive"
                        )} />
                        <span className={cn(
                          "text-xs",
                          product.inStock ? "text-success" : "text-destructive"
                        )}>
                          {product.inStock ? `${product.stockCount} in stock` : 'Out of Stock'}
                        </span>
                      </div>

                      {/* Add to Cart */}
                      <Button
                        className="w-full gap-2"
                        disabled={!product.inStock}
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
