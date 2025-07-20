"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { LevelCompletionPopup } from "../level-completion-popup"

type BossProblem = {
  type: "conversion" | "addition" | "subtraction" | "arrangement" | "comparison"
  question: string
  answer: string | string[]
  choices?: string[]
  hint: string
}

const bossProblems: BossProblem[] = [
  {
    type: "conversion",
    question: "Convert 9/4 to a mixed number",
    answer: "2 1/4",
    choices: ["2 1/4", "2 1/2", "2 1/3", "2 1/5"],
    hint: "Divide 9 by 4: 9 ÷ 4 = 2 remainder 1, so it's 2 1/4",
  },
  {
    type: "conversion",
    question: "Convert 2 3/5 to an improper fraction",
    answer: "13/5",
    choices: ["5/2", "13/5", "7/5", "11/5"],
    hint: "Multiply 2 × 5 = 10, then add 3: 10 + 3 = 13, so it's 13/5",
  },
  {
    type: "addition",
    question: "Which pair adds up to 5/6?",
    answer: "2/3 + 1/6",
    choices: ["1/2 + 1/3", "2/3 + 1/6", "1/4 + 1/2"],
    hint: "Check: 2/3 + 1/6 = 4/6 + 1/6 = 5/6",
  },
  {
    type: "subtraction",
    question: "What is 7/8 - 3/8?",
    answer: "1/2",
    choices: ["4/8", "1/2", "4/16", "5/8"],
    hint: "Same denominators: 7 - 3 = 4, so 4/8 = 1/2",
  },
  {
    type: "arrangement",
    question: "Arrange from least to greatest: 3/4, 2/3, 5/6, 1/2",
    answer: "1/2, 2/3, 3/4, 5/6",
    choices: ["1/2, 2/3, 3/4, 5/6", "1/2, 3/4, 2/3, 5/6", "5/6, 3/4, 2/3, 1/2", "2/3, 1/2, 3/4, 5/6"],
    hint: "Convert to common denominator 12: 1/2=6/12, 2/3=8/12, 3/4=9/12, 5/6=10/12",
  },
  {
    type: "comparison",
    question: "Compare 4/5 and 3/4",
    answer: ">",
    choices: [">", "<", "="],
    hint: "Convert to common denominator 20: 4/5 = 16/20, 3/4 = 15/20. Since 16 > 15, we have 4/5 > 3/4",
  },
  {
    type: "addition",
    question: "What is 2/3 + 1/6?",
    answer: "5/6",
    choices: ["3/9", "5/6", "2/6", "3/6"],
    hint: "Convert to common denominator 6: 2/3 = 4/6, then 4/6 + 1/6 = 5/6",
  },
]

export default function DreadpointHollowStory() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentProblem, setCurrentProblem] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [phantomHealth, setPhantomHealth] = useState(7)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [battlePhase, setBattlePhase] = useState<"intro" | "battle" | "victory">("intro")
  const supabase = createClient()

  const startBattle = () => {
    setGameStarted(true)
    setBattlePhase("battle")
    setCurrentProblem(0)
    setScore(0)
    setPhantomHealth(7)
    setSelectedAnswer("")
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const checkAnswer = () => {
    const problem = bossProblems[currentProblem]
    const isCorrect = selectedAnswer === problem.answer

    if (isCorrect) {
      setScore(score + 25)
      setPhantomHealth(phantomHealth - 1)

      toast({
        title: "Critical Hit!",
        description: `The Decimal Phantom takes damage! Health: ${phantomHealth - 1}/7`,
        variant: "default",
      })

      // Check if phantom is defeated
      if (phantomHealth - 1 <= 0) {
        setBattlePhase("victory")
        setTimeout(() => {
          endGame()
        }, 2000)
        return
      }

      // Move to next problem
      setTimeout(() => {
        setCurrentProblem(currentProblem + 1)
        setSelectedAnswer("")
      }, 1500)
    } else {
      toast({
        title: "Attack Missed!",
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
          waypoint_id: 10, // Dreadpoint Hollow waypoint ID
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
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-black flex flex-col items-center justify-center p-4 font-['Blaka']">
      {/* Background */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      <div className="relative z-10 max-w-4xl w-full">
        {battlePhase === "intro" ? (
          // Intro Screen
          <div className="text-center bg-red-100 rounded-lg p-8 shadow-2xl border-4 border-red-600">
            <h1 className="text-4xl font-bold text-red-900 mb-4">Dreadpoint Hollow</h1>
            <p className="text-xl text-red-800 mb-6">Face the Decimal Phantom in the ultimate fraction challenge!</p>
            <div className="bg-red-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-bold text-red-900 mb-2">Final Boss Battle:</h3>
              <ul className="text-red-800 space-y-1">
                <li>• Answer fraction problems to damage the Phantom</li>
                <li>• The Phantom has 7 health points</li>
                <li>• Use all your fraction skills to win</li>
                <li>• Defeat the Phantom to restore the Fraction Orb!</li>
              </ul>
            </div>
            <Button onClick={startBattle} className="bg-red-600 hover:bg-red-700 text-white text-xl px-8 py-4">
              Face the Phantom!
            </Button>
          </div>
        ) : battlePhase === "victory" ? (
          // Victory Screen
          <div className="text-center bg-gold-100 rounded-lg p-8 shadow-2xl border-4 border-gold-600">
            <h1 className="text-4xl font-bold text-gold-900 mb-4">Victory!</h1>
            <p className="text-xl text-gold-800 mb-6">The Decimal Phantom is defeated! The Fraction Orb is restored!</p>
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-lg text-gold-700">Numeria is saved thanks to your fraction mastery!</p>
          </div>
        ) : (
          // Battle Screen
          <div className="text-center">
            {/* Header */}
            <div className="bg-red-100 rounded-lg p-4 mb-6 shadow-lg border-2 border-red-600">
              <div className="flex justify-between items-center">
                <div className="text-red-900">
                  <span className="text-lg font-bold">Score: {score}</span>
                </div>
                <div className="text-red-900">
                  <span className="text-lg font-bold">Phantom Health: {phantomHealth}/7</span>
                </div>
                <div className="text-red-900">
                  <span className="text-lg font-bold">Attack {currentProblem + 1}</span>
                </div>
              </div>
            </div>

            {/* Phantom Health Bar */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-lg border-2 border-red-600">
              <div className="flex justify-center mb-2">
                <div className="text-4xl">👻</div>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-4">
                <div
                  className="bg-red-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(phantomHealth / 7) * 100}%` }}
                ></div>
              </div>
              <p className="text-red-700 mt-2">Decimal Phantom</p>
            </div>

            {/* Problem */}
            <div className="bg-white rounded-lg p-8 shadow-2xl border-4 border-red-600 mb-6">
              <h2 className="text-2xl font-bold text-red-900 mb-6">{bossProblems[currentProblem]?.question}</h2>

              {bossProblems[currentProblem]?.choices ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {bossProblems[currentProblem].choices!.map((choice, index) => (
                    <Button
                      key={index}
                      onClick={() => handleAnswerSelect(choice)}
                      className={`text-xl py-4 ${
                        selectedAnswer === choice ? "bg-red-600 text-white" : "bg-red-100 text-red-900 hover:bg-red-200"
                      } border-2 border-red-600`}
                    >
                      {choice}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="mb-6">
                  <Input
                    type="text"
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    placeholder="Enter your answer"
                    className="text-2xl text-center max-w-md mx-auto"
                  />
                </div>
              )}

              <Button
                onClick={checkAnswer}
                disabled={!selectedAnswer || gameEnded}
                className="bg-red-600 hover:bg-red-700 text-white text-xl px-8 py-3 mb-4"
              >
                Attack!
              </Button>

              <div className="text-sm text-red-700">Hint: {bossProblems[currentProblem]?.hint}</div>
            </div>

            {/* Exit Button */}
            <Button onClick={() => router.push(`/student/game?location=${searchParams.get('location') || 'dreadpoint-hollow'}`)} className="bg-gray-600 hover:bg-gray-700 text-white">
              Retreat
            </Button>
          </div>
        )}
      </div>

      {/* Completion Popup */}
      <LevelCompletionPopup
        isOpen={showCompletionPopup}
        onClose={() => {
          setShowCompletionPopup(false)
          const location = searchParams.get('location') || 'dreadpoint-hollow';
          router.push(`/student/game?location=${location}`);
        }}
        levelId="10"
        levelName="Dreadpoint Hollow"
        score={score}
        isStory={false}
      />
    </div>
  )
}
