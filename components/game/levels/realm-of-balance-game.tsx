"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { LevelCompletionPopup } from "../level-completion-popup"

type ComparisonQuestion = {
  leftFraction: string
  rightFraction: string
  correctAnswer: ">" | "<" | "="
  leftValue: number
  rightValue: number
}

export default function RealmOfBalanceGame() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [questions, setQuestions] = useState<ComparisonQuestion[]>([])
  const [dialoguePhase, setDialoguePhase] = useState<"intro" | "game" | "feedback" | "complete">("intro")
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCompletionPopup, setShowLevelCompletionPopup] = useState(false)
  const supabase = createClient()

  // Generate comparison questions
  useEffect(() => {
    if (!gameStarted) {
      const generatedQuestions = generateQuestions(5)
      setQuestions(generatedQuestions)
    }
  }, [gameStarted])

  const generateQuestions = (count: number): ComparisonQuestion[] => {
    const questions: ComparisonQuestion[] = []

    for (let i = 0; i < count; i++) {
      // Decide what type of question to generate
      const questionType = Math.floor(Math.random() * 3) // 0: >, 1: <, 2: =

      if (questionType === 2) {
        // Equal fractions
        const denominator1 = Math.floor(Math.random() * 8) + 2 // 2-9
        const numerator1 = Math.floor(Math.random() * (denominator1 - 1)) + 1 // 1 to denominator-1

        // Create an equivalent fraction
        const multiplier = Math.floor(Math.random() * 3) + 2 // 2-4
        const denominator2 = denominator1 * multiplier
        const numerator2 = numerator1 * multiplier

        questions.push({
          leftFraction: `${numerator1}/${denominator1}`,
          rightFraction: `${numerator2}/${denominator2}`,
          correctAnswer: "=",
          leftValue: numerator1 / denominator1,
          rightValue: numerator2 / denominator2,
        })
      } else {
        // Generate two different fractions
        let leftNumerator, leftDenominator, rightNumerator, rightDenominator
        let leftValue, rightValue

        do {
          leftDenominator = Math.floor(Math.random() * 8) + 2 // 2-9
          leftNumerator = Math.floor(Math.random() * (leftDenominator - 1)) + 1 // 1 to denominator-1

          rightDenominator = Math.floor(Math.random() * 8) + 2 // 2-9
          rightNumerator = Math.floor(Math.random() * (rightDenominator - 1)) + 1 // 1 to denominator-1

          leftValue = leftNumerator / leftDenominator
          rightValue = rightNumerator / rightDenominator
        } while (Math.abs(leftValue - rightValue) < 0.05 || leftValue === rightValue) // Ensure they're not too close or equal

        const correctAnswer = leftValue > rightValue ? ">" : "<"

        questions.push({
          leftFraction: `${leftNumerator}/${leftDenominator}`,
          rightFraction: `${rightNumerator}/${rightDenominator}`,
          correctAnswer,
          leftValue,
          rightValue,
        })
      }
    }

    return questions
  }

  const startGame = () => {
    setGameStarted(true)
    setDialoguePhase("game")
    setScore(0)
    setCurrentQuestion(0)
    setFeedback(null)
  }

  const handleAnswer = (answer: ">" | "<" | "=") => {
    if (currentQuestion >= questions.length) return

    const isCorrect = answer === questions[currentQuestion].correctAnswer

    if (isCorrect) {
      setScore(score + 20)
      setFeedback("correct")

      toast({
        title: "Correct!",
        description: "The scales are balanced with truth.",
        variant: "default",
      })
    } else {
      setFeedback("incorrect")

      toast({
        title: "Incorrect",
        description: "The scales tilt with uncertainty.",
        variant: "destructive",
      })
    }

    setDialoguePhase("feedback")

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setDialoguePhase("game")
        setFeedback(null)
      } else {
        setDialoguePhase("complete")
        endGame()
      }
    }, 1500)
  }

  const endGame = async () => {
    setGameEnded(true)
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if record exists first
        const { data: existingProgress } = await supabase
          .from("student_progress")
          .select("*")
          .eq("student_id", user.id)
          .eq("waypoint_id", 9) // Realm of Balance waypoint ID
          .maybeSingle()

        if (existingProgress) {
          // Update existing record only if new score is higher
          const newScore = Math.max(existingProgress.score || 0, score)
          const { error: updateError } = await supabase
            .from("student_progress")
            .update({
              completed: true,
              score: newScore,
              last_updated: new Date().toISOString(),
            })
            .eq("student_id", user.id)
            .eq("waypoint_id", 9)

          if (updateError) {
            console.error("Error updating progress:", updateError)
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase.from("student_progress").insert({
            student_id: user.id,
            waypoint_id: 9,
            completed: true,
            score: score,
            last_updated: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Error inserting progress:", insertError)
          }
        }
      }
    } catch (error) {
      console.error("Error ending game:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden"
      style={{
          backgroundImage: "url('/game backgrounds/Realm of Balance.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
    >
      {/* Background */}
      <div className="absolute inset-0 flex items-center justify-center bg-blue-900 bg-opacity-40">
        <div className="w-full h-full flex items-center justify-center text-4xl font-pixel text-blue-200">
          Realm of Balance
        </div>
      </div>

      {/* Game Area */}
      {dialoguePhase === "game" && questions.length > 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 pb-40">
          <div className="bg-blue-800 bg-opacity-90 p-8 rounded-lg mb-8 w-full max-w-6xl mx-auto">
            <h2 className="text-2xl font-pixel text-blue-200 mb-2">The Scale of Judgment</h2>
            <div className="text-blue-300 text-lg mb-4">
              Question {currentQuestion + 1} of {questions.length} • Score: {score}
            </div>

            <div className="flex justify-center items-center space-x-8 mb-6">
              <div className="bg-blue-600 p-8 rounded-lg text-center w-48">
                <div className="text-white font-pixel text-3xl">{questions[currentQuestion].leftFraction}</div>
              </div>

              <div className="text-white font-pixel text-6xl">?</div>

              <div className="bg-blue-600 p-8 rounded-lg text-center w-48">
                <div className="text-white font-pixel text-3xl">{questions[currentQuestion].rightFraction}</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <Button
                onClick={() => handleAnswer(">")}
                className="font-pixel bg-blue-600 hover:bg-blue-700 text-white text-4xl px-8 py-6"
              >
                &gt;
              </Button>
              <Button
                onClick={() => handleAnswer("=")}
                className="font-pixel bg-blue-600 hover:bg-blue-700 text-white text-4xl px-8 py-6"
              >
                =
              </Button>
              <Button
                onClick={() => handleAnswer("<")}
                className="font-pixel bg-blue-600 hover:bg-blue-700 text-white text-4xl px-8 py-6"
              >
                &lt;
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogue Box */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 border-t-4 border-blue-800 p-6">
        <div className="text-blue-300 font-pixel text-lg mb-2">Guardian of Equilibrium</div>
        <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px]">
          {dialoguePhase === "intro" && (
            <>
              "To pass through the Realm of Balance, you must decide... Which fraction weighs more? Which weighs less?
              Or do they match? Choose the correct symbol: &gt;, &lt;, or =."
            </>
          )}
          {dialoguePhase === "feedback" && feedback === "correct" && (
            <>"Well judged! Your understanding of fractions brings balance to the scales."</>
          )}
          {dialoguePhase === "feedback" && feedback === "incorrect" && (
            <>
              "The scales tilt with uncertainty. Remember to find a common denominator to compare fractions accurately."
            </>
          )}
          {dialoguePhase === "complete" && (
            <>
              "You have judged with wisdom. The scales are balanced. The path to Dreadpoint Hollow is now open. Proceed,
              Whiskers, and face your final challenge."
            </>
          )}
        </div>
        <div className="flex justify-between">
          {dialoguePhase === "intro" && (
            <Button onClick={startGame} className="font-pixel bg-blue-600 hover:bg-blue-700 text-white">
              Begin Trial
            </Button>
          )}
          {dialoguePhase === "complete" && !showCompletionPopup && (
            <Button
              onClick={() => setShowLevelCompletionPopup(true)}
              className="font-pixel bg-blue-600 hover:bg-blue-700 text-white"
            >
              Complete Trial
            </Button>
          )}
        </div>
      </div>

      {/* Emergency exit button */}
      <div className="absolute top-4 right-4">
        <Button
          onClick={() => router.push("/student/game")}
          className="font-pixel bg-gray-600 hover:bg-gray-700 text-white"
        >
          Exit Realm
        </Button>
      </div>

      {/* Completion Popup */}
      <LevelCompletionPopup
        isOpen={showCompletionPopup}
        onClose={() => {
          setShowLevelCompletionPopup(false)
          router.push("/student/game")
        }}
        levelId="9"
        levelName="Realm of Balance"
        score={score}
        maxScore={100}
        isStory={false}
      />
    </div>
  )
}
