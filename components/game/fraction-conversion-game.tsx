"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Award } from "lucide-react"

interface FractionConversionGameProps {
  waypointId: number
  userId: string
  onComplete: (score: number, mistakes: number, attempts: number) => void
}

type GameMode = "improper-to-mixed" | "mixed-to-improper"
type GameState = "tutorial" | "playing" | "complete"

interface Question {
  question: string
  answer: string
  options?: string[]
  mode: GameMode
}

export function FractionConversionGame({ waypointId, userId, onComplete }: FractionConversionGameProps) {
  const [gameState, setGameState] = useState<GameState>("tutorial")
  const [gameMode, setGameMode] = useState<GameMode>("improper-to-mixed")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Generate questions
  const generateQuestion = (mode: GameMode): Question => {
    if (mode === "improper-to-mixed") {
      // Generate improper fraction
      const denominator = Math.floor(Math.random() * 8) + 2 // 2-9
      const wholeNumber = Math.floor(Math.random() * 3) + 1 // 1-3
      const numerator = Math.floor(Math.random() * (denominator - 1)) + 1 // 1 to denominator-1
      const improperNumerator = wholeNumber * denominator + numerator

      return {
        question: `${improperNumerator}/${denominator}`,
        answer: `${wholeNumber} ${numerator}/${denominator}`,
        mode,
      }
    } else {
      // Generate mixed number
      const denominator = Math.floor(Math.random() * 8) + 2 // 2-9
      const wholeNumber = Math.floor(Math.random() * 3) + 1 // 1-3
      const numerator = Math.floor(Math.random() * (denominator - 1)) + 1 // 1 to denominator-1
      const improperNumerator = wholeNumber * denominator + numerator

      return {
        question: `${wholeNumber} ${numerator}/${denominator}`,
        answer: `${improperNumerator}/${denominator}`,
        mode,
      }
    }
  }

  // Start the game
  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setMistakes(0)
    setAttempts(0)
    setTimeLeft(60)
    setStreak(0)
    setCurrentQuestion(generateQuestion(gameMode))
  }

  // Switch game mode
  const switchGameMode = (mode: GameMode) => {
    setGameMode(mode)
    setCurrentQuestion(generateQuestion(mode))
  }

  // Handle answer submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentQuestion) return

    setAttempts((prev) => prev + 1)

    // Normalize answers for comparison (remove spaces, etc.)
    const normalizedUserAnswer = userAnswer.trim().replace(/\s+/g, " ")
    const normalizedCorrectAnswer = currentQuestion.answer.trim().replace(/\s+/g, " ")

    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      // Correct answer
      setScore((prev) => prev + 10)
      setStreak((prev) => prev + 1)
      setFeedback("Correct! Great job!")

      // Bonus for streak
      if (streak === 4) {
        // This will be the 5th correct answer
        setTimeLeft((prev) => prev + 10)
        setFeedback("Perfect streak! +10 seconds bonus!")
        setStreak(0)
      }

      // Next question
      setCurrentQuestion(generateQuestion(gameMode))
      setUserAnswer("")
    } else {
      // Wrong answer
      setMistakes((prev) => prev + 1)
      setStreak(0)

      if (gameMode === "improper-to-mixed") {
        setFeedback("Try again! Remember to divide the numerator by the denominator.")
      } else {
        setFeedback("Try again! Remember to multiply the whole number by the denominator and add the numerator.")
      }
    }

    // Clear feedback after 2 seconds
    setTimeout(() => {
      setFeedback(null)
    }, 2000)
  }

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameState("complete")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Complete game effect
  useEffect(() => {
    if (gameState === "complete") {
      onComplete(score, mistakes, attempts)
    }
  }, [gameState, score, mistakes, attempts, onComplete])

  // Tutorial content
  const renderTutorial = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-pixel text-amber-900">Welcome to Squeaks' Sorting Table!</h2>
      <p className="font-pixel text-amber-700">
        In this game, you'll practice converting between improper fractions and mixed numbers.
      </p>

      <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-300">
        <h3 className="font-pixel text-amber-900 mb-2">How to Convert Improper Fractions to Mixed Numbers:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li className="font-pixel text-amber-800">Divide the numerator by the denominator</li>
          <li className="font-pixel text-amber-800">The quotient is the whole number</li>
          <li className="font-pixel text-amber-800">The remainder is the new numerator</li>
          <li className="font-pixel text-amber-800">Keep the same denominator</li>
        </ol>
        <p className="font-pixel text-amber-800 mt-2">Example: 7/4 = 1 3/4</p>
      </div>

      <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-300">
        <h3 className="font-pixel text-amber-900 mb-2">How to Convert Mixed Numbers to Improper Fractions:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li className="font-pixel text-amber-800">Multiply the whole number by the denominator</li>
          <li className="font-pixel text-amber-800">Add the numerator</li>
          <li className="font-pixel text-amber-800">Keep the same denominator</li>
        </ol>
        <p className="font-pixel text-amber-800 mt-2">Example: 2 3/5 = 13/5</p>
      </div>

      <div className="flex justify-center space-x-4">
        <Button
          onClick={() => {
            setGameMode("improper-to-mixed")
            startGame()
          }}
          className="font-pixel bg-amber-600 hover:bg-amber-700 text-white"
        >
          Practice Improper to Mixed
        </Button>
        <Button
          onClick={() => {
            setGameMode("mixed-to-improper")
            startGame()
          }}
          className="font-pixel bg-amber-600 hover:bg-amber-700 text-white"
        >
          Practice Mixed to Improper
        </Button>
      </div>
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
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-amber-600 mr-1" />
          <span className="font-pixel text-amber-900">Time: {timeLeft}s</span>
        </div>
      </div>

      {feedback && (
        <Alert
          className={
            feedback.includes("Correct") || feedback.includes("streak")
              ? "bg-green-50 border-green-200"
              : "bg-amber-100 border-amber-300"
          }
        >
          <AlertDescription
            className={
              feedback.includes("Correct") || feedback.includes("streak") ? "text-green-800" : "text-amber-800"
            }
          >
            {feedback}
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-amber-100 p-6 rounded-lg border-2 border-amber-300 text-center">
        <h3 className="font-pixel text-amber-900 mb-4">
          {gameMode === "improper-to-mixed"
            ? "Convert this improper fraction to a mixed number:"
            : "Convert this mixed number to an improper fraction:"}
        </h3>
        <p className="text-3xl font-pixel text-amber-800 mb-6">{currentQuestion?.question}</p>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-4">
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={gameMode === "improper-to-mixed" ? "e.g., 1 3/4" : "e.g., 7/4"}
              className="max-w-xs border-amber-300 bg-amber-50 font-pixel text-center text-lg"
              required
            />
            <Button type="submit" className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
              Submit Answer
            </Button>
          </div>
        </form>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={() => switchGameMode(gameMode === "improper-to-mixed" ? "mixed-to-improper" : "improper-to-mixed")}
          variant="outline"
          className="font-pixel border-amber-600 text-amber-700"
        >
          Switch to {gameMode === "improper-to-mixed" ? "Mixed to Improper" : "Improper to Mixed"}
        </Button>

        <Button
          onClick={() => setGameState("complete")}
          variant="outline"
          className="font-pixel border-amber-600 text-amber-700"
        >
          End Game
        </Button>
      </div>
    </div>
  )

  // Complete screen
  const renderComplete = () => (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-pixel text-amber-900">Game Complete!</h2>

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

      <div className="flex justify-center space-x-4">
        <Button onClick={() => startGame()} className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
          Play Again
        </Button>
      </div>
    </div>
  )

  return (
    <Card className="border-2 border-amber-800 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-2xl font-pixel text-amber-900">
          {gameState === "tutorial" && "Squeaks' Sorting Table: Fractions in Motion!"}
          {gameState === "playing" &&
            `${gameMode === "improper-to-mixed" ? "Improper to Mixed" : "Mixed to Improper"} Challenge`}
          {gameState === "complete" && "Challenge Complete!"}
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
