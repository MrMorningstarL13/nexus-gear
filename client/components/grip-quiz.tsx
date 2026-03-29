'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ArrowRight, ArrowLeft, Hand, Crosshair, Gamepad2, ShoppingCart, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface QuizOption {
  value: string
  label: string
  description: string
  icon?: React.ReactNode
}

const handSizeOptions: QuizOption[] = [
  { value: 'S', label: 'Small', description: 'Length < 17cm', icon: <span className="text-2xl">🤏</span> },
  { value: 'M', label: 'Medium', description: 'Length 17-19cm', icon: <span className="text-2xl">✋</span> },
  { value: 'L', label: 'Large', description: 'Length > 19cm', icon: <span className="text-2xl">🖐️</span> },
]

const gripTypeOptions: QuizOption[] = [
  { 
    value: 'Palm', 
    label: 'Palm Grip', 
    description: 'Full hand contact with the mouse',
    icon: <Hand className="h-8 w-8" />
  },
  { 
    value: 'Claw', 
    label: 'Claw Grip', 
    description: 'Fingertips bent at 90 degrees',
    icon: <span className="text-2xl">🦀</span>
  },
  { 
    value: 'Tip', 
    label: 'Fingertip Grip', 
    description: 'Only fingertips touch the mouse',
    icon: <span className="text-2xl">👆</span>
  },
]

const gameGenreOptions: QuizOption[] = [
  { 
    value: 'FPS', 
    label: 'FPS / Shooters', 
    description: 'CS2, Valorant, CoD, Apex',
    icon: <Crosshair className="h-8 w-8" />
  },
  { 
    value: 'MOBA', 
    label: 'MOBA / Strategy', 
    description: 'LoL, Dota 2, Starcraft',
    icon: <Gamepad2 className="h-8 w-8" />
  },
]

export function GripQuiz() {
  const { 
    quiz, 
    closeQuiz, 
    setQuizStep, 
    setHandSize, 
    setGripType, 
    setGameGenre,
    calculateRecommendations,
    resetQuiz,
    addToCart,
    setCartOpen
  } = useStore()

  const { isOpen, step, handSize, gripType, gameGenre, recommendations } = quiz

  const handleNext = () => {
    if (step === 3) {
      calculateRecommendations()
    } else {
      setQuizStep(step + 1)
    }
  }

  const handleBack = () => {
    setQuizStep(step - 1)
  }

  const canProceed = useMemo(() => {
    if (step === 1) return handSize !== null
    if (step === 2) return gripType !== null
    if (step === 3) return gameGenre !== null
    return true
  }, [step, handSize, gripType, gameGenre])

  const handleAddRecommendation = (productId: string) => {
    const product = recommendations.find((p) => p.id === productId)
    if (product) {
      addToCart(product)
      closeQuiz()
      resetQuiz()
      setCartOpen(true)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={closeQuiz}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="relative w-full max-w-2xl bg-card border-border overflow-hidden">
          {/* Close Button */}
          <button
            onClick={closeQuiz}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Hand className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Find Your Perfect Mouse</h2>
                <p className="text-sm text-muted-foreground">
                  {step < 4 ? `Step ${step} of 3` : 'Your Recommendations'}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {step < 4 && (
              <div className="mt-4 flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      s <= step ? "bg-primary" : "bg-secondary"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Hand Size */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">What&apos;s your hand size?</h3>
                <p className="text-sm text-muted-foreground">
                  Measure from the base of your palm to the tip of your middle finger.
                </p>
                <div className="grid gap-3">
                  {handSizeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setHandSize(option.value as 'S' | 'M' | 'L')}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border text-left transition-all",
                        handSize === option.value
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
                      )}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                        {option.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{option.label}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Grip Type */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">How do you grip your mouse?</h3>
                <p className="text-sm text-muted-foreground">
                  Select the grip style that feels most natural to you.
                </p>
                <div className="grid gap-3">
                  {gripTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGripType(option.value as 'Palm' | 'Claw' | 'Tip')}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border text-left transition-all",
                        gripType === option.value
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
                      )}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary">
                        {option.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{option.label}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Game Genre */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">What games do you mainly play?</h3>
                <p className="text-sm text-muted-foreground">
                  Different games benefit from different mouse characteristics.
                </p>
                <div className="grid gap-3">
                  {gameGenreOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGameGenre(option.value as 'FPS' | 'MOBA')}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border text-left transition-all",
                        gameGenre === option.value
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
                      )}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary">
                        {option.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{option.label}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Recommendations */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Top 3 Mice For You
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Based on your {handSize} hand, {gripType?.toLowerCase()} grip, and {gameGenre} preference
                  </p>
                </div>
                
                <div className="grid gap-4">
                  {recommendations.map((product, index) => (
                    <div
                      key={product.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-all",
                        index === 0 
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {/* Rank */}
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                        index === 0 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>

                      {/* Image */}
                      <div className="relative h-16 w-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-2"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground">{product.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.specs['DPI']} DPI | {product.specs['Weight']}
                        </p>
                      </div>

                      {/* Price & Action */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-foreground">${product.price.toFixed(2)}</p>
                        <Button
                          size="sm"
                          onClick={() => handleAddRecommendation(product.id)}
                          className="mt-1 gap-1"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All / Restart */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetQuiz()
                      setQuizStep(1)
                    }}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Start Over
                  </Button>
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => {
                      closeQuiz()
                      resetQuiz()
                    }}
                    asChild
                  >
                    <Link href="/">
                      View All Mice
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          {step < 4 && (
            <div className="flex items-center justify-between border-t border-border p-4">
              <Button
                variant="ghost"
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
                {step === 3 ? 'See Results' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
