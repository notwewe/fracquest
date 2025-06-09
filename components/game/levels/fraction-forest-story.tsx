"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { LevelCompletionPopup } from "../level-completion-popup"

type ArrangementProblem = {
  fractions: string[]
  correctOrder: number[]
  hint: string
}

const forestProblems: ArrangementProblem[] = [
  {
    fractions: ["2/3", "1/2", "5/6", "3/8"],
    correctOrder: [3, 1, 0, 2], // 3/8, 1/2, 2/3, 5/6
    hint: "Convert to common denominator 24: 3/8=9/24, 1/2=12/24, 2/3=16/24, 5/6=20/24",
  },
  {
    fractions: ["4/5", "7/10", "3/4", "2/3"],
    correctOrder: [3, 2, 1, 0], // 2/3, 3/4, 7/10, 4/5
    hint: "Convert to common denominator 60: 2/3=40/60, 3/4=45/60, 7/10=42/60, 4/5=48/60",
  },
  {
    fractions: ["5/12", "3/8", "7/12", "1/3"],
    correctOrder: [3, 0, 1, 2], // 1/3, 5/12, 3/8, 7/12
    hint: "Convert to common denominator 24: 1/3=8/24, 5/12=10/24, 3/8=9/24, 7/12=14/24",
  },
]

export default function FractionForestStory() {
  const router = useRouter()
  const [currentProblem, setCurrentProblem] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [treesRestored, setTreesRestored] = useState(0)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const startGame = () => {
    setGameStarted(true)
    setCurrentProblem(0)
    setScore(0)
    setTreesRestored(0)
    setSelectedOrder([])
  }

  const handleFractionClick = (index: number) => {
    if (selectedOrder.includes(index)) {
      // Remove from selection
      setSelectedOrder(selectedOrder.filter((i) => i !== index))
    } else {
      // Add to selection
      setSelectedOrder([...selectedOrder, index])
    }
  }

  const checkAnswer = () => {
    const problem = forestProblems[currentProblem]
    const isCorrect = JSON.stringify(selectedOrder) === JSON.stringify(problem.correctOrder)

    if (isCorrect) {
      setScore(score + 30)
      setTreesRestored(treesRestored + 1)

      toast({
        title: "Correct!",
        description: `Tree set ${treesRestored + 1} begins to flourish!`,
        variant: "default",
      })

      // Check if forest is complete (3 tree sets)
      if (treesRestored + 1 >= 3) {
        setTimeout(() => {
          endGame()
        }, 1500)
        return
      }

      // Move to next problem
      setTimeout(() => {
        setCurrentProblem(currentProblem + 1)
        setSelectedOrder([])
      }, 1500)
    } else {
      toast({
        title: "Incorrect Order",
        description: problem.hint,
        variant: "destructive",
      })
    }
  }

  const endGame = async () => {
    setGameEnded(true)
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Save completion to database
        const { error } = await supabase.from("student_progress").upsert({
          student_id: user.id,
          waypoint_id: 8, // Fraction Forest waypoint ID
          completed: true,
          score: score,
          can_revisit: true,
          last_updated: new Date().toISOString(),
        })

        if (error) {
          console.error("Error saving progress:", error)
        }
      }

      setShowCompletionPopup(true)
    } catch (error) {
      console.error("Error ending game:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetOrder = () => {
    setSelectedOrder([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-900 flex flex-col items-center justify-center p-4 font-['Blaka']">
      {/* Background */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>

      <div className="relative z-10 max-w-4xl w-full">
        {!gameStarted ? (
          // Start Screen
          <div className="text-center bg-green-100 rounded-lg p-8 shadow-2xl border-4 border-green-600">
            <h1 className="text-4xl font-bold text-green-900 mb-4">Fraction Forest</h1>
            <p className="text-xl text-green-800 mb-6">
              Help Elder Barkroot restore the forest by arranging fraction trees in order!
            </p>
            <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-bold text-green-900 mb-2">How to Play:</h3>
              <ul className="text-green-800 space-y-1">
                <li>• Arrange fractions from smallest to largest</li>
                <li>• Click fractions in the correct order</li>
                <li>• Complete 3 tree arrangements to restore the forest</li>
                <li>• Use common denominators to compare fractions</li>
              </ul>
            </div>
            <Button onClick={startGame} className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-4">
              Enter the Forest!
            </Button>
          </div>
        ) : (
          // Game Screen
          <div className="text-center">
            {/* Header */}
            <div className="bg-green-100 rounded-lg p-4 mb-6 shadow-lg border-2 border-green-600">
              <div className="flex justify-between items-center">
                <div className="text-green-900">
                  <span className="text-lg font-bold">Score: {score}</span>
                </div>
                <div className="text-green-900">
                  <span className="text-lg font-bold">Tree Sets: {treesRestored}/3</span>
                </div>
                <div className="text-green-900">
                  <span className="text-lg font-bold">Set {currentProblem + 1}/3</span>
                </div>
              </div>
            </div>

            {/* Forest Visual */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-lg border-2 border-green-600">
              <div className="flex justify-center mb-4 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <div className={`text-6xl ${i < treesRestored ? "text-green-600" : "text-gray-400"}`}>🌳</div>
                    <div className="text-sm text-green-700">Set {i + 1}</div>
                  </div>
                ))}
              </div>
              <p className="text-green-700">Fraction Forest Restoration</p>
            </div>

            {/* Problem */}
            <div className="bg-white rounded-lg p-8 shadow-2xl border-4 border-green-600 mb-6">
              <h2 className="text-2xl font-bold text-green-900 mb-4">
                Arrange these fractions from smallest to largest:
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {forestProblems[currentProblem]?.fractions.map((fraction, index) => (
                  <Button
                    key={index}
                    onClick={() => handleFractionClick(index)}
                    className={`text-2xl py-8 ${
                      selectedOrder.includes(index)
                        ? "bg-green-600 text-white"
                        : "bg-green-100 text-green-900 hover:bg-green-200"
                    } border-2 border-green-600`}
                  >
                    {fraction}
                    {selectedOrder.includes(index) && (
                      <span className="ml-2 text-sm">({selectedOrder.indexOf(index) + 1})</span>
                    )}
                  </Button>
                ))}
              </div>

              <div className="mb-4">
                <p className="text-green-700 mb-2">Selected order:</p>
                <div className="text-xl text-green-900">
                  {selectedOrder.map((index, pos) => (
                    <span key={pos}>
                      {forestProblems[currentProblem]?.fractions[index]}
                      {pos < selectedOrder.length - 1 ? " < " : ""}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={resetOrder} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3">
                  Reset Order
                </Button>
                <Button
                  onClick={checkAnswer}
                  disabled={selectedOrder.length !== 4 || gameEnded}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                >
                  Arrange Trees
                </Button>
              </div>

              <div className="mt-4 text-sm text-green-700">Hint: {forestProblems[currentProblem]?.hint}</div>
            </div>

            {/* Exit Button */}
            <Button onClick={() => router.push("/student/game")} className="bg-red-600 hover:bg-red-700 text-white">
              Exit Forest
            </Button>
          </div>
        )}
      </div>

      {/* Completion Popup */}
      <LevelCompletionPopup
        isOpen={showCompletionPopup}
        onClose={() => {
          setShowCompletionPopup(false)
          router.push("/student/game")
        }}
        levelId="8"
        levelName="Fraction Forest"
        score={score}
        isStory={false}
      />
    </div>
  )
}
