'use client'

import { useState, useCallback } from 'react'
import { Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SwitchType {
  name: string
  type: 'Red' | 'Blue' | 'Brown'
  description: string
  color: string
  waveColor: string
}

const switches: SwitchType[] = [
  {
    name: 'Cherry MX Red',
    type: 'Red',
    description: 'Linear - Smooth and silent',
    color: 'bg-red-500',
    waveColor: 'rgba(239, 68, 68, 0.5)'
  },
  {
    name: 'Cherry MX Blue',
    type: 'Blue',
    description: 'Clicky - Audible click feedback',
    color: 'bg-blue-500',
    waveColor: 'rgba(59, 130, 246, 0.5)'
  },
  {
    name: 'Cherry MX Brown',
    type: 'Brown',
    description: 'Tactile - Subtle bump feedback',
    color: 'bg-amber-700',
    waveColor: 'rgba(180, 83, 9, 0.5)'
  }
]

interface WaveAnimation {
  id: number
  x: number
  color: string
}

interface SwitchSoundboardProps {
  currentSwitch?: 'Red' | 'Blue' | 'Brown'
}

export function SwitchSoundboard({ currentSwitch }: SwitchSoundboardProps) {
  const [activeSwitch, setActiveSwitch] = useState<SwitchType | null>(null)
  const [waves, setWaves] = useState<WaveAnimation[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

  const playSound = useCallback((switchType: SwitchType, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    
    setActiveSwitch(switchType)
    setIsPlaying(true)
    
    // Add wave animation
    const newWave: WaveAnimation = {
      id: Date.now(),
      x,
      color: switchType.waveColor
    }
    setWaves((prev) => [...prev, newWave])
    
    // Remove wave after animation
    setTimeout(() => {
      setWaves((prev) => prev.filter((w) => w.id !== newWave.id))
    }, 600)
    
    // Reset active state
    setTimeout(() => {
      setIsPlaying(false)
      setActiveSwitch(null)
    }, 200)
  }, [])

  return (
    <div className="space-y-4 pt-6 border-t border-border">
      <div className="flex items-center gap-2">
        <Volume2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Test the Switches</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Click on each switch type to experience the feel and sound characteristics.
      </p>
      
      <div className="grid gap-3">
        {switches.map((sw) => (
          <button
            key={sw.type}
            onClick={(e) => playSound(sw, e)}
            className={cn(
              "relative overflow-hidden rounded-lg border p-4 text-left transition-all",
              "hover:border-primary/50 hover:bg-secondary/50",
              currentSwitch === sw.type && "ring-2 ring-primary border-primary",
              activeSwitch?.type === sw.type && "scale-[0.98]"
            )}
          >
            {/* Waves */}
            {waves
              .filter((w) => activeSwitch?.type === sw.type)
              .map((wave) => (
                <span
                  key={wave.id}
                  className="absolute top-1/2 -translate-y-1/2 h-full aspect-square rounded-full animate-ping"
                  style={{
                    left: wave.x,
                    backgroundColor: wave.color,
                    animationDuration: '0.6s'
                  }}
                />
              ))}
            
            <div className="relative flex items-center gap-4">
              {/* Switch Color Indicator */}
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                sw.color
              )}>
                <div className="h-4 w-4 rounded-sm bg-background/30" />
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{sw.name}</h3>
                  {currentSwitch === sw.type && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      This keyboard
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{sw.description}</p>
              </div>
              
              {/* Visual Feedback */}
              <div className={cn(
                "flex items-center gap-1 transition-opacity",
                activeSwitch?.type === sw.type ? "opacity-100" : "opacity-30"
              )}>
                {[...Array(sw.type === 'Blue' ? 5 : sw.type === 'Brown' ? 3 : 2)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1 rounded-full transition-all",
                      sw.color,
                      activeSwitch?.type === sw.type ? "animate-pulse" : ""
                    )}
                    style={{
                      height: `${12 + (i % 3) * 8}px`,
                      animationDelay: `${i * 50}ms`
                    }}
                  />
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Sound Wave Visualization */}
      <div className="relative h-16 rounded-lg bg-secondary/50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          {[...Array(32)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-150",
                isPlaying ? activeSwitch?.color : "bg-muted-foreground/20"
              )}
              style={{
                height: isPlaying 
                  ? `${Math.random() * 40 + 10}px`
                  : '4px',
                transitionDelay: `${i * 10}ms`
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "text-xs font-medium transition-opacity",
            isPlaying ? "opacity-0" : "opacity-50"
          )}>
            Click a switch to hear it
          </span>
        </div>
      </div>
    </div>
  )
}
