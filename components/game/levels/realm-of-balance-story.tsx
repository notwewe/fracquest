"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { LevelCompletionPopup } from "../level-completion-popup"

type ComparisonProblem = {
  fraction1: string
  fraction2: string
  correctSymbol: string
  hint: string
}

const balanceProblems: ComparisonProblem[] = [
  {
    fraction1: "3/4",
    fraction2: "2/3",
    correctSymbol: ">",
    hint: "Convert to common denominator 12: 3/4 = 9/12, 2/3 = 8/12. Since 9 > 8, we have 3/4 > 2/3",
  },
  {
    fraction1: "5/10",
    fraction2: "1/2",
    correctSymbol: "=",
    hint: "5/10 simplifies to 1/2, so 5/10 = 1/2",
  },
  {
    fraction1: "4/9",
    fraction2: "5/9",
    correctSymbol: "<",
    hint: "Same denominators, so compare numerators: 4 < 5, therefore 4/9 < 5/9",
  },
  {
    fraction1: "2/5",
    fraction2: "3/8",
    correctSymbol: ">",
    hint: "Convert to common denominator 40: 2/5 = 16/40, 3/8 = 15/40. Since 16 > 15, we have 2/5 > 3/8",
  },
  {
    fraction1: "7/12",
    fraction2: "3/5",
    correctSymbol: "<",
    hint: "Convert to common denominator 60: 7/12 = 35/60, 3/5 = 36/60. Since 35 < 36, we have 7/12 < 3/5",
  },
]

export default function RealmOfBalanceStory() {
  const router = useRouter()
  const [currentProblem, setCurrentProblem] = useState(0)
  const [selectedSymbol, setSelectedSymbol] = useState("")
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [scalesBalanced, setScalesBalanced] = useState(0)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const symbols = [">", "<", "="]

  const startGame = () => {
    setGameStarted(true)
    setCurrentProblem(0)
    setScore(0)
    setScalesBalanced(0)
    setSelectedSymbol("")
  }

  const handleSymbolClick = (symbol: string) => {
    setSelectedSymbol(symbol)
  }

  const checkAnswer = () => {
    const problem = balanceProblems[currentProblem]
    const isCorrect = selectedSymbol === problem.correctSymbol

    if (isCorrect) {
      setScore(score + 20)
      setScalesBalanced(scalesBalanced + 1)

      toast({
        title: "Correct!",
        description: `Scale ${scalesBalanced + 1} is balanced!`,
        variant: "default",
      })

      // Check if all scales are balanced (5 scales)
      if (scalesBalanced + 1 >= 5) {
        setTimeout(() => {
          endGame()
        }, 1500)
        return
      }

      // Move to next problem
      setTimeout(() => {
        setCurrentProblem(currentProblem + 1)
        setSelectedSymbol("")
      }, 1500)
    } else {
      toast({
        title: "Incorrect",
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
          waypoint_id: 9, // Realm of Balance waypoint ID
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-800 to-purple-900 flex flex-col items-center justify-center p-4 font-['Blaka']"
    style={{
          backgroundImage: "url('/game backgrounds/Realm of Balance.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>

      <div className="relative z-10 max-w-4xl w-full">
        {!gameStarted ? (
          // Start Screen
          <div className="text-center bg-purple-100 rounded-lg p-8 shadow-2xl border-4 border-purple-600">
            <h1 className="text-4xl font-bold text-purple-900 mb-4">Realm of Balance</h1>
            <p className="text-xl text-purple-800 mb-6">
              Help the Guardian of Equilibrium balance the scales by comparing fractions!
            </p>
            <div className="bg-purple-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-bold text-purple-900 mb-2">How to Play:</h3>
              <ul className="text-purple-800 space-y-1">
                <li>• Compare two fractions and choose the correct symbol</li>
                <li>• Use &gt;, &lt;, or = to show the relationship</li>
                <li>• Balance 5 scales to complete the realm</li>
                <li>• Find common denominators to compare accurately</li>
              </ul>
            </div>
            <Button onClick={startGame} className="bg-purple-600 hover:bg-purple-700 text-white text-xl px-8 py-4">
              Enter the Realm!
            </Button>
          </div>
        ) : (
          // Game Screen
          <div className="text-center">
            {/* Header */}
            <div className="bg-purple-100 rounded-lg p-4 mb-6 shadow-lg border-2 border-purple-600">
              <div className="flex justify-between items-center">
                <div className="text-purple-900">
                  <span className="text-lg font-bold">Score: {score}</span>
                </div>
                <div className="text-purple-900">
                  <span className="text-lg font-bold">Scales Balanced: {scalesBalanced}/5</span>
                </div>
                <div className="text-purple-900">
                  <span className="text-lg font-bold">Scale {currentProblem + 1}/5</span>
                </div>
              </div>
            </div>

            {/* Scale Visual */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-lg border-2 border-purple-600">
              <div className="flex justify-center mb-4">
                <div className="text-6xl">⚖️</div>
              </div>
              <p className="text-purple-700">Scale of Judgment</p>
            </div>

            {/* Problem */}
            <div className="bg-white rounded-lg p-8 shadow-2xl border-4 border-purple-600 mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-6">Compare these fractions:</h2>

              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-6xl font-bold text-purple-800 bg-purple-100 p-4 rounded-lg border-2 border-purple-600">
                  {balanceProblems[currentProblem]?.fraction1}
                </div>

                <div className="text-4xl text-purple-600">{selectedSymbol || "?"}</div>

                <div className="text-6xl font-bold text-purple-800 bg-purple-100 p-4 rounded-lg border-2 border-purple-600">
                  {balanceProblems[currentProblem]?.fraction2}
                </div>
              </div>

              <div className="flex justify-center gap-4 mb-6">
                {symbols.map((symbol) => (
                  <Button
                    key={symbol}
                    onClick={() => handleSymbolClick(symbol)}
                    className={`text-3xl py-6 px-8 ${
                      selectedSymbol === symbol
                        ? "bg-purple-600 text-white"
                        : "bg-purple-100 text-purple-900 hover:bg-purple-200"
                    } border-2 border-purple-600`}
                  >
                    {symbol}
                  </Button>
                ))}
              </div>

              <Button
                onClick={checkAnswer}
                disabled={!selectedSymbol || gameEnded}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xl px-8 py-3 mb-4"
              >
                Balance the Scale
              </Button>

              <div className="text-sm text-purple-700">Hint: {balanceProblems[currentProblem]?.hint}</div>
            </div>

            {/* Exit Button */}
            <Button onClick={() => router.push("/student/game")} className="bg-red-600 hover:bg-red-700 text-white">
              Exit Realm
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
        levelId="9"
        levelName="Realm of Balance"
        score={score}
        isStory={false}
      />
    </div>
  )
}
