"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Award } from "lucide-react"
import { LevelCompletionPopup } from "@/components/game/level-completion-popup"

type Props = {
  waypointId: number
  userId: string
  levelName?: string
}

interface Question {
  fraction1: string
  fraction2: string
  options: string[]
  answer: string
}

export function BridgeGame({ waypointId, userId, levelName = "Bridge Builder Challenge" }: Props) {
  const [gameState, setGameState] = useState<"tutorial" | "playing" | "complete">("tutorial")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [score, setScore] = useState(20) // Start with max score
  const [mistakes, setMistakes] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [bridgeTiles, setBridgeTiles] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)
  const [totalQuestions] = useState(5) // 5 questions per game
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Generate a fraction subtraction question
  const generateQuestion = (): Question => {
    // Decide if we'll use same or different denominators
    const sameDenominator = Math.random() > 0.5

    if (sameDenominator) {
      // Same denominator
      const denominator = Math.floor(Math.random() * 8) + 2 // 2-9
      const numerator2 = Math.floor(Math.random() * (denominator - 1)) + 1 // 1 to denominator-1
      const numerator1 = numerator2 + Math.floor(Math.random() * (denominator - numerator2)) + 1 // Ensure result is positive

      const difference = numerator1 - numerator2
      const answer = difference === 0 ? "0" : difference === denominator ? "1" : `${difference}/${denominator}`

      // Generate options
      const options = [answer, `${numerator1 + 1}/${denominator}`, `${numerator2}/${numerator1}`].sort(
        () => Math.random() - 0.5,
      )

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

      // Find LCD
      const lcd = lcm(denominator1, denominator2)

      // Ensure result is positive
      const newNumerator2 = Math.floor(Math.random() * (lcd - 1)) + 1 // 1 to lcd-1
      const newNumerator1 = newNumerator2 + Math.floor(Math.random() * (lcd - newNumerator2)) + 1 // Ensure result is positive

      // Convert back to original fractions
      const numerator1 = newNumerator1 / (lcd / denominator1)
      const numerator2 = newNumerator2 / (lcd / denominator2)

      // Only use this question if the conversion results in whole numbers
      if (Number.isInteger(numerator1) && Number.isInteger(numerator2)) {
        // Calculate difference
        const difference = newNumerator1 - newNumerator2

        // Simplify the fraction
        const gcd = findGCD(difference, lcd)
        const simplifiedNumerator = difference / gcd
        const simplifiedDenominator = lcd / gcd

        const answer =
          simplifiedNumerator === 0
            ? "0"
            : simplifiedNumerator === simplifiedDenominator
              ? "1"
              : `${simplifiedNumerator}/${simplifiedDenominator}`

        // Generate options
        const options = [
          answer,
          `${numerator1 - numerator2}/${denominator1 * denominator2}`,
          `${numerator1}/${denominator1 - denominator2}`,
        ].sort(() => Math.random() - 0.5)

        return {
          fraction1: `${numerator1}/${denominator1}`,
          fraction2: `${numerator2}/${denominator2}`,
          options,
          answer,
        }
      } else {
        // If we got non-integer numerators, try again with same denominators
        return generateQuestion()
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
    setScore(20) // Reset to max score
    setMistakes(0)
    setAttempts(0)
    setBridgeTiles(0)
    setCurrentQuestionNumber(1)
    setCurrentQuestion(generateQuestion())
  }

  // Handle answer selection
  const handleAnswer = (selectedAnswer: string) => {
    if (!currentQuestion) return

    setAttempts((prev) => prev + 1)

    if (selectedAnswer === currentQuestion.answer) {
      // Correct answer
      setFeedback("Correct! Another stone finds its place.")
      setBridgeTiles((prev) => {
        const newValue = prev + 1
        return newValue
      })

      // Move to next question or complete game
      if (currentQuestionNumber < totalQuestions) {
        // Next question after a short delay
        setTimeout(() => {
          setCurrentQuestionNumber((prev) => prev + 1)
          setCurrentQuestion(generateQuestion())
          setFeedback(null)
        }, 1500)
      } else {
        // Game complete after a short delay
        setTimeout(() => {
          setGameState("complete")
        }, 1500)
      }
    } else {
      // Wrong answer
      setMistakes((prev) => prev + 1)
      // Each mistake reduces score by 2 points
      setScore((prev) => Math.max(0, prev - 2))
      setFeedback("Numbers crumble under pressure. Look again, traveler.")

      // Clear feedback after 1.5 seconds
      setTimeout(() => {
        setFeedback(null)
      }, 1500)
    }
  }

  // Complete game effect
  useEffect(() => {
    if (gameState === "complete") {
      saveProgress()
    }
  }, [gameState, score, mistakes, attempts])

  // Save progress to database
  const saveProgress = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      // Save progress to database
      await supabase.from("student_progress").upsert({
        student_id: userId,
        waypoint_id: waypointId,
        completed: true,
        score: score,
        attempts: attempts,
        mistakes: mistakes,
      })

      // Show completion popup
      setShowCompletionPopup(true)
    } catch (error) {
      console.error("Error saving progress:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Tutorial content
  const renderTutorial = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-pixel text-amber-900">Lessmore Bridge</h2>
      <p className="font-pixel text-amber-700">
        To restore the bridge, you need to master the art of fraction subtraction. Each correct answer will add a stone
        to the bridge.
      </p>

      <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-300">
        <h3 className="font-pixel text-amber-900 mb-2">Subtracting Fractions with the Same Denominator:</h3>
        <p className="font-pixel text-amber-800">
          When fractions have the same denominator (bottom number), just subtract the numerators (top numbers) and keep
          the denominator the same.
        </p>
        <div className="font-pixel text-amber-800 mt-2">Example: 5/8 - 2/8 = 3/8</div>
      </div>

      <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-300">
        <h3 className="font-pixel text-amber-900 mb-2">Subtracting Fractions with Different Denominators:</h3>
        <p className="font-pixel text-amber-800">
          When fractions have different denominators, you need to find a common denominator first.
        </p>
        <ol className="list-decimal pl-5 space-y-2 font-pixel text-amber-800">
          <li>Find the Least Common Denominator (LCD)</li>
          <li>Convert each fraction to an equivalent fraction with the LCD</li>
          <li>Subtract the numerators and keep the LCD as the denominator</li>
          <li>Simplify the result if needed</li>
        </ol>
        <div className="font-pixel text-amber-800 mt-2">Example: 3/4 - 1/2 = 3/4 - 2/4 = 1/4</div>
      </div>

      <Button onClick={startGame} className="w-full font-pixel bg-amber-600 hover:bg-amber-700 text-white">
        Start Building the Bridge
      </Button>
    </div>
  )

  // Game content
  const renderGame = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Award className="h-5 w-5 text-amber-600 mr-1" />
          <span className="font-pixel text-amber-900">Score: {score}/20</span>
        </div>
        <div className="font-pixel text-amber-900">
          Bridge Tiles: {bridgeTiles}/{totalQuestions}
        </div>
      </div>

      <div className="bg-amber-100 p-3 rounded-lg border-2 border-amber-300">
        <div className="flex justify-between items-center">
          <span className="font-pixel text-amber-900">
            Question {currentQuestionNumber} of {totalQuestions}
          </span>
          <span className="font-pixel text-amber-900">Mistakes: {mistakes}</span>
        </div>
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
        <h3 className="font-pixel text-amber-900 mb-4">Subtract these fractions:</h3>
        <p className="text-3xl font-pixel text-amber-800 mb-6">
          {currentQuestion?.fraction1} - {currentQuestion?.fraction2} = ?
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
        <div className="relative w-full h-20 bg-amber-200 rounded-lg border-4 border-amber-800 overflow-hidden">
          {/* Bridge tiles visualization */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: totalQuestions }).map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-full border-r-2 border-amber-300 ${
                  index < bridgeTiles ? "bg-amber-600" : "bg-transparent"
                } transition-colors duration-500`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Complete screen
  const renderComplete = () => (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-pixel text-amber-900">Bridge Restored!</h2>

      <div className="relative w-full h-20 bg-amber-600 rounded-lg border-4 border-amber-800 overflow-hidden">
        {/* Completed bridge */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: totalQuestions }).map((_, index) => (
            <div key={index} className="flex-1 h-full border-r-2 border-amber-700" />
          ))}
        </div>
      </div>

      <p className="font-pixel text-amber-800">
        The bridge is complete! You can now cross to the other side and continue your journey.
      </p>

      <div className="bg-amber-100 p-6 rounded-lg border-2 border-amber-300">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="font-pixel text-amber-900">Score</h3>
            <p className="text-3xl font-pixel text-amber-800">{score}/20</p>
          </div>
          <div>
            <h3 className="font-pixel text-amber-900">Mistakes</h3>
            <p className="text-3xl font-pixel text-amber-800">{mistakes}</p>
          </div>
          <div>
            <h3 className="font-pixel text-amber-900">Questions</h3>
            <p className="text-3xl font-pixel text-amber-800">{totalQuestions}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Button onClick={() => startGame()} className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
          Play Again
        </Button>
        <Button
          onClick={() => router.push("/student/game")}
          className="font-pixel bg-amber-600 hover:bg-amber-700 text-white"
        >
          Return to Map
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-amber-800 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-2xl font-pixel text-amber-900">
              {gameState === "tutorial" && "Bridge Builder Challenge"}
              {gameState === "playing" && "Restoring Lessmore Bridge"}
              {gameState === "complete" && "Bridge Restored!"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gameState === "tutorial" && renderTutorial()}
            {gameState === "playing" && renderGame()}
            {gameState === "complete" && renderComplete()}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              onClick={() => router.push("/student/game")}
              variant="outline"
              className="font-pixel border-amber-600 text-amber-700"
            >
              Back to Map
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Completion Popup */}
      <LevelCompletionPopup
        isOpen={showCompletionPopup}
        onClose={() => {
          setShowCompletionPopup(false)
          router.push("/student/game")
        }}
        levelId={waypointId.toString()}
        levelName={levelName}
        score={score}
        maxScore={20}
        isStory={false}
      />
    </div>
  )
}
