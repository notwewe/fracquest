"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Award } from "lucide-react"
import { trackWaypointTime, updateStudentProgress } from "@/lib/time-tracking"

interface FractionAdditionGameProps {
  waypointId: number
  userId: string
  onComplete: (score: number, mistakes: number, attempts: number) => void
}

interface Question {
  fraction1: string
  fraction2: string
  options: string[]
  answer: string
}

export function FractionAdditionGame({ waypointId, userId, onComplete }: FractionAdditionGameProps) {
  const [gameState, setGameState] = useState<"tutorial" | "playing" | "complete">("tutorial")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [score, setScore] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [compassPieces, setCompassPieces] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Generate a fraction addition question
  const generateQuestion = (): Question => {
    // Decide if we'll use same or different denominators
    const sameDenominator = Math.random() > 0.5

    if (sameDenominator) {
      // Same denominator
      const denominator = Math.floor(Math.random() * 8) + 2 // 2-9
      const numerator1 = Math.floor(Math.random() * (denominator - 1)) + 1 // 1 to denominator-1
      const numerator2 = Math.floor(Math.random() * (denominator - numerator1)) + 1 // Ensure sum < denominator

      const sum = numerator1 + numerator2
      const answer = sum === denominator ? "1" : `${sum}/${denominator}`

      // Generate options
      const options = [
        answer,
        `${numerator1 - 1 > 0 ? numerator1 - 1 : numerator1 + 1}/${denominator}`,
        `${numerator1}/${numerator2}`,
      ].sort(() => Math.random() - 0.5)

      return {
        fraction1: `${numerator1}/${denominator}`,
        fraction2: `${numerator2}/${denominator}`,
        options,
        answer,
      }
    } else {
      // Different denominators
      const denominator1 = Math.floor(Math.random() * 5) + 2 // 2-6
      let denominator2 = Math.floor(Math.random() * 5) + 2 // 2-6

      // Ensure different denominators
      while (denominator2 === denominator1) {
        denominator2 = Math.floor(Math.random() * 5) + 2
      }

      const numerator1 = Math.floor(Math.random() * (denominator1 - 1)) + 1 // 1 to denominator1-1
      const numerator2 = Math.floor(Math.random() * (denominator2 - 1)) + 1 // 1 to denominator2-1

      // Find LCD
      const lcd = lcm(denominator1, denominator2)

      // Convert to equivalent fractions
      const newNumerator1 = numerator1 * (lcd / denominator1)
      const newNumerator2 = numerator2 * (lcd / denominator2)

      // Calculate sum
      const sum = newNumerator1 + newNumerator2

      // Simplify the fraction
      const gcd = findGCD(sum, lcd)
      const simplifiedNumerator = sum / gcd
      const simplifiedDenominator = lcd / gcd

      const answer =
        simplifiedNumerator === simplifiedDenominator
          ? "1"
          : simplifiedNumerator > simplifiedDenominator
            ? `${Math.floor(simplifiedNumerator / simplifiedDenominator)} ${simplifiedNumerator % simplifiedDenominator}/${simplifiedDenominator}`
            : `${simplifiedNumerator}/${simplifiedDenominator}`

      // Generate options
      const options = [
        answer,
        `${numerator1 + numerator2}/${denominator1 * denominator2}`,
        `${numerator1}/${denominator1 + denominator2}`,
      ].sort(() => Math.random() - 0.5)

      return {
        fraction1: `${numerator1}/${denominator1}`,
        fraction2: `${numerator2}/${denominator2}`,
        options,
        answer,
      }
    }
  }

  // Helper functions for fractions
  function findGCD(a: number, b: number): number {
    return b === 0 ? a : findGCD(b, a % b)
  }

  function lcm(a: number, b: number): number {
    return (a * b) / findGCD(a, b)
  }

  // Start the game
  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setMistakes(0)
    setAttempts(0)
    setCompassPieces(0)
    setCurrentQuestion(generateQuestion())
  }

  // Handle answer selection
  const handleAnswer = (selectedAnswer: string) => {
    if (!currentQuestion) return

    setAttempts((prev) => prev + 1)

    if (selectedAnswer === currentQuestion.answer) {
      // Correct answer
      setScore((prev) => prev + 10)
      setFeedback("Correct! The compass piece fits perfectly!")
      setCompassPieces((prev) => {
        const newValue = prev + 1
        if (newValue >= 5) {
          // Game complete after 5 correct answers
          setTimeout(() => {
            setGameState("complete")
          }, 1500)
        }
        return newValue
      })

      // Next question after a short delay
      setTimeout(() => {
        setCurrentQuestion(generateQuestion())
        setFeedback(null)
      }, 1500)
    } else {
      // Wrong answer
      setMistakes((prev) => prev + 1)
      setFeedback("That doesn't align with the others. Try again!")

      // Clear feedback after 1.5 seconds
      setTimeout(() => {
        setFeedback(null)
      }, 1500)
    }
  }

  // Complete game effect
  useEffect(() => {
    if (gameState === "complete") {
      onComplete(score, mistakes, attempts)
    }
  }, [gameState, score, mistakes, attempts, onComplete])

  // Tutorial content
  const renderTutorial = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-pixel text-amber-900">Assembling the Fraction Compass</h2>
      <p className="font-pixel text-amber-700">
        To assemble the compass, you need to add fractions correctly. Each correct answer will add a piece to the
        compass.
      </p>

      <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-300">
        <h3 className="font-pixel text-amber-900 mb-2">Adding Fractions with the Same Denominator:</h3>
        <p className="font-pixel text-amber-800">
          When fractions have the same denominator (bottom number), just add the numerators (top numbers) and keep the
          denominator the same.
        </p>
        <div className="font-pixel text-amber-800 mt-2">Example: 1/4 + 2/4 = 3/4</div>
      </div>

      <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-300">
        <h3 className="font-pixel text-amber-900 mb-2">Adding Fractions with Different Denominators:</h3>
        <p className="font-pixel text-amber-800">
          When fractions have different denominators, you need to find a common denominator first.
        </p>
        <ol className="list-decimal pl-5 space-y-2 font-pixel text-amber-800">
          <li>Find the Least Common Denominator (LCD)</li>
          <li>Convert each fraction to an equivalent fraction with the LCD</li>
          <li>Add the numerators and keep the LCD as the denominator</li>
          <li>Simplify the result if needed</li>
        </ol>
        <div className="font-pixel text-amber-800 mt-2">Example: 1/2 + 1/4 = 2/4 + 1/4 = 3/4</div>
      </div>

      <Button onClick={startGame} className="w-full font-pixel bg-amber-600 hover:bg-amber-700 text-white">
        Start Assembling the Compass
      </Button>
    </div>
  )

  // Game content
  const renderGame = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Award className="h-5 w-5 text-amber-600 mr-1" />
          <span className="font-pixel text-amber-900">Score: {score}</span>
        </div>
        <div className="font-pixel text-amber-900">Compass Pieces: {compassPieces}/5</div>
      </div>

      {feedback && (
        <Alert
          className={feedback.includes("Correct") ? "bg-green-50 border-green-200" : "bg-amber-100 border-amber-300"}
        >
          <AlertDescription className={feedback.includes("Correct") ? "text-green-800" : "text-amber-800"}>
            {feedback}
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-amber-100 p-6 rounded-lg border-2 border-amber-300 text-center">
        <h3 className="font-pixel text-amber-900 mb-4">Add these fractions:</h3>
        <p className="text-3xl font-pixel text-amber-800 mb-6">
          {currentQuestion?.fraction1} + {currentQuestion?.fraction2} = ?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentQuestion?.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(option)}
              className="font-pixel bg-amber-600 hover:bg-amber-700 text-white"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative w-40 h-40 bg-amber-200 rounded-full border-4 border-amber-800 overflow-hidden">
          {/* Compass pieces visualization */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={`absolute w-1/2 h-1/2 ${getCompassPiecePosition(index)} ${
                index < compassPieces ? "bg-amber-600" : "bg-amber-300"
              } transition-colors duration-500`}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-amber-900 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )

  // Helper for compass piece positioning
  const getCompassPiecePosition = (index: number): string => {
    switch (index) {
      case 0:
        return "top-0 left-0"
      case 1:
        return "top-0 right-0"
      case 2:
        return "bottom-0 left-0"
      case 3:
        return "bottom-0 right-0"
      case 4:
        return "top-1/4 left-1/4 w-1/2 h-1/2 rounded-full"
      default:
        return ""
    }
  }

  // Complete screen
  const renderComplete = () => (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-pixel text-amber-900">Compass Assembled!</h2>

      <div className="flex justify-center mb-4">
        <div className="w-40 h-40 bg-amber-600 rounded-full border-4 border-amber-800 animate-pulse"></div>
      </div>

      <p className="font-pixel text-amber-800">
        The compass glows and levitates, pointing the way to your next challenge!
      </p>

      <div className="bg-amber-100 p-6 rounded-lg border-2 border-amber-300">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="font-pixel text-amber-900">Score</h3>
            <p className="text-3xl font-pixel text-amber-800">{score}</p>
          </div>
          <div>
            <h3 className="font-pixel text-amber-900">Mistakes</h3>
            <p className="text-3xl font-pixel text-amber-800">{mistakes}</p>
          </div>
          <div>
            <h3 className="font-pixel text-amber-900">Attempts</h3>
            <p className="text-3xl font-pixel text-amber-800">{attempts}</p>
          </div>
        </div>
      </div>
    </div>
  )

  // Time tracking
  const startTimeRef = useRef<number>(Date.now())
  const lastTrackTimeRef = useRef<number>(Date.now())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Track time in chunks
  useEffect(() => {
    // Track time every 30 seconds
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const timeSpent = now - lastTrackTimeRef.current

      if (timeSpent > 1000) {
        // Only track if more than 1 second has passed
        trackWaypointTime(userId, waypointId, timeSpent)
        lastTrackTimeRef.current = now
      }
    }, 30000) // 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Track final time when component unmounts
      const finalTime = Date.now() - lastTrackTimeRef.current
      if (finalTime > 1000) {
        trackWaypointTime(userId, waypointId, finalTime)
      }
    }
  }, [userId, waypointId])

  // Handle game completion
  const handleGameComplete = async () => {
    if (gameState === "complete") return

    setGameState("complete")

    // Calculate total time spent
    const totalTimeSpent = Math.round((Date.now() - startTimeRef.current) / 1000) // in seconds

    // Update progress with completion data
    await updateStudentProgress(userId, waypointId, {
      completed: true,
      score,
      mistakes,
      attempts,
      timeSpent: totalTimeSpent,
    })

    // Clear the interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Call the onComplete callback
    onComplete(score, mistakes, attempts)
  }

  // Handle attempt
  const handleAnswerUpdated = (selectedAnswer: string) => {
    if (!currentQuestion) return

    setAttempts((prev) => prev + 1)

    if (selectedAnswer === currentQuestion.answer) {
      // Correct answer
      setScore((prev) => prev + 10)
      setFeedback("Correct! The compass piece fits perfectly!")
      setCompassPieces((prev) => {
        const newValue = prev + 1
        if (newValue >= 5) {
          // Game complete after 5 correct answers
          setTimeout(() => {
            handleGameComplete()
          }, 1500)
        }
        return newValue
      })

      // Next question after a short delay
      setTimeout(() => {
        setCurrentQuestion(generateQuestion())
        setFeedback(null)
      }, 1500)
    } else {
      // Wrong answer
      setMistakes((prev) => prev + 1)
      setFeedback("That doesn't align with the others. Try again!")

      // Clear feedback after 1.5 seconds
      setTimeout(() => {
        setFeedback(null)
      }, 1500)
    }
  }

  return (
    <Card className="border-2 border-amber-800 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-2xl font-pixel text-amber-900">
          {gameState === "tutorial" && "Compass Completion Quest"}
          {gameState === "playing" && "Assembling the Fraction Compass"}
          {gameState === "complete" && "Compass Assembled!"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {gameState === "tutorial" && renderTutorial()}
        {gameState === "playing" && renderGame()}
        {gameState === "complete" && renderComplete()}
      </CardContent>
    </Card>
  )
}
