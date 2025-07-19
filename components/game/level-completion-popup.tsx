"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Award, Star } from "lucide-react"

interface LevelCompletionPopupProps {
  isOpen: boolean
  onClose: () => void
  levelId: string
  levelName: string
  score: number
  maxScore?: number
  isStory?: boolean
  isGameOver?: boolean
  onRetry?: () => void
  passed?: boolean
}

export function LevelCompletionPopup({
  isOpen,
  onClose,
  levelId,
  levelName,
  score,
  maxScore = 100,
  isStory = false,
  isGameOver = false,
  onRetry,
  passed = false,
}: LevelCompletionPopupProps) {
  const [stars, setStars] = useState(0)

  useEffect(() => {
    // Calculate stars based on score percentage
    const percentage = (score / maxScore) * 100
    let starsCount = 0

    if (percentage >= 90) {
      starsCount = 3
    } else if (percentage >= 70) {
      starsCount = 2
    } else if (percentage >= 50) {
      starsCount = 1
    }

    setStars(starsCount)
  }, [score, maxScore])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-amber-50 border-2 border-amber-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-pixel text-center text-amber-900">
            {isGameOver ? "Game Over" : isStory ? "Story Complete!" : passed ? "Level Passed!" : "Level Complete!"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="text-center">
            <h3 className="font-pixel text-amber-800 text-lg mb-2">{levelName}</h3>
            {!isStory && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Award className="h-6 w-6 text-amber-600" />
                <span className="font-pixel text-amber-900 text-xl">
                  {score}/{maxScore}
                </span>
              </div>
            )}
          </div>

          {!isStory && !isGameOver && (
            <div className="flex justify-center space-x-2">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-10 w-10 ${
                    i < stars ? "text-amber-500 fill-amber-500" : "text-amber-300"
                  } transition-all duration-300 ${i < stars ? "scale-110" : "scale-100"}`}
                />
              ))}
            </div>
          )}

          <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-300 text-center">
            <p className="font-pixel text-amber-800">
              {isGameOver
                ? "You made 3 mistakes on the same question. Would you like to retry?"
                : isStory
                  ? "You've completed this part of the story! Continue your journey to save Numeria!"
                  : passed
                    ? "Congratulations! You passed this level. You can continue to the next level or retry to improve your score!"
                    : "Good effort! Try again to improve your score! (Score at least 60 to pass)"}
            </p>
          </div>
        </div>

        <DialogFooter>
          {isGameOver || (!passed && !isGameOver) ? (
            <Button onClick={onRetry} className="w-full font-pixel bg-red-600 hover:bg-red-700 text-white">
              Retry
            </Button>
          ) : passed ? (
            <div className="flex gap-2 w-full">
              <Button onClick={onClose} className="flex-1 font-pixel bg-amber-600 hover:bg-amber-700 text-white">
                Continue
              </Button>
              <Button onClick={onRetry} className="flex-1 font-pixel bg-red-600 hover:bg-red-700 text-white">
                Retry
              </Button>
            </div>
          ) : (
            <Button onClick={onClose} className="w-full font-pixel bg-amber-600 hover:bg-amber-700 text-white">
              Continue
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
