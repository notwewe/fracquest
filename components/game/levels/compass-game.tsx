"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { LevelCompletionPopup } from "../level-completion-popup"
import { DialogueBox } from "../dialogue-box"

type CompassGameProps = {
  levelId: string
  onComplete?: () => void
}

export function CompassGame({ levelId, onComplete }: CompassGameProps) {
  const router = useRouter()
  const [gameState, setGameState] = useState<"intro" | "tutorial" | "playing" | "completed">("intro")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState<"" | "correct" | "incorrect">("")
  const [timer, setTimer] = useState(0)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [currentDialogue, setCurrentDialogue] = useState(0)
  const supabase = createClient()

  // Introduction dialogue
  const introDialogue = [
    {
      character: "Elder Pebble",
      text: "Welcome to the Addition Challenge of Arithmetown! I'm Elder Pebble, and I'll guide you through this test.",
    },
    {
      character: "Elder Pebble",
      text: "The Fraction Compass is a powerful tool that helps navigate through the numerical realms, but it requires understanding fraction addition.",
    },
    {
      character: "Elder Pebble",
      text: "To add fractions, we need to find a common denominator first. Then we add the numerators while keeping the denominator the same.",
    },
    {
      character: "Whiskers",
      text: "I understand! So if I want to add 1/4 + 2/4, I keep the denominator 4 and add 1 + 2 to get 3/4?",
    },
    {
      character: "Elder Pebble",
      text: "Exactly right, young adventurer! But what if the denominators are different? Let me show you how to handle that.",
    },
  ]

  // Tutorial content
  const tutorialContent = [
    {
      title: "Adding Fractions with the Same Denominator",
      steps: ["Keep the denominator the same", "Add the numerators", "Simplify the fraction if possible"],
      example: {
        problem: "Add 2/5 + 1/5",
        solution: [
          "The denominators are the same (5), so we keep it",
          "Add the numerators: 2 + 1 = 3",
          "The result is 3/5",
        ],
      },
    },
    {
      title: "Adding Fractions with Different Denominators",
      steps: [
        "Find the least common multiple (LCM) of the denominators",
        "Convert each fraction to an equivalent fraction with the LCM as the denominator",
        "Add the numerators while keeping the common denominator",
        "Simplify the result if possible",
      ],
      example: {
        problem: "Add 1/3 + 1/4",
        solution: [
          "The LCM of 3 and 4 is 12",
          "Convert 1/3 to 4/12 (multiply top and bottom by 4)",
          "Convert 1/4 to 3/12 (multiply top and bottom by 3)",
          "Add the numerators: 4/12 + 3/12 = 7/12",
          "7/12 is already in its simplest form",
        ],
      },
    },
  ]

  // Game questions
  const questions = [
    {
      question: "1/5 + 2/5 = ?",
      answer: "3/5",
      hint: "Add the numerators (1 + 2) and keep the denominator (5).",
    },
    {
      question: "1/4 + 3/8 = ?",
      answer: "5/8",
      hint: "Convert 1/4 to 2/8, then add 2/8 + 3/8.",
    },
    {
      question: "2/3 + 1/6 = ?",
      answer: "5/6",
      hint: "Convert 2/3 to 4/6, then add 4/6 + 1/6.",
    },
    {
      question: "3/10 + 2/5 = ?",
      answer: "7/10",
      hint: "Convert 2/5 to 4/10, then add 3/10 + 4/10.",
    },
    {
      question: "1/2 + 1/3 = ?",
      answer: "5/6",
      hint: "Convert to the common denominator 6: 3/6 + 2/6.",
    },
  ]

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (gameState === "playing") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [gameState])

  // Handle dialogue progression
  const handleDialogueComplete = () => {
    if (currentDialogue < introDialogue.length - 1) {
      setCurrentDialogue((prev) => prev + 1)
    } else {
      setGameState("tutorial")
    }
  }

  // Handle tutorial completion
  const handleTutorialComplete = () => {
    setGameState("playing")
  }

  // Handle answer submission
  const handleSubmit = () => {
    const currentQ = questions[currentQuestion]
    const userAnswer = answer.trim()
    const isCorrect = userAnswer === currentQ.answer

    if (isCorrect) {
      setFeedback("correct")
      setScore((prev) => prev + 20)
      toast({
        title: "Correct!",
        description: "Great job! You got it right.",
        variant: "default",
      })

      // Move to next question or complete game
      setTimeout(() => {
        setFeedback("")
        setAnswer("")

        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion((prev) => prev + 1)
        } else {
          completeGame()
        }
      }, 1500)
    } else {
      setFeedback("incorrect")
      toast({
        title: "Not quite right",
        description: currentQ.hint,
        variant: "destructive",
      })

      // Clear feedback after a delay
      setTimeout(() => {
        setFeedback("")
      }, 2000)
    }
  }

  // Complete the game
  const completeGame = async () => {
    setGameState("completed")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Calculate final score (max 100)
        const finalScore = Math.min(100, score)

        // Save progress to database
        await supabase.from("student_progress").upsert({
          student_id: user.id,
          waypoint_id: Number.parseInt(levelId),
          completed: true,
          score: finalScore,
          time_spent: timer,
          last_updated: new Date().toISOString(),
        })

        // Show completion popup
        setShowCompletionPopup(true)
      }
    } catch (error) {
      console.error("Error saving game progress:", error)
      toast({
        title: "Error",
        description: "There was a problem saving your progress.",
        variant: "destructive",
      })
    }
  }

  // Render intro dialogue
  if (gameState === "intro") {
    return (
      <div className="relative h-screen w-full bg-black overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 flex items-center justify-center bg-amber-900 bg-opacity-20">
          <div className="w-full h-full flex items-center justify-center text-4xl font-pixel text-amber-200">
            Arithmetown
          </div>
        </div>

        {/* Dialogue */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <DialogueBox
            text={introDialogue[currentDialogue].text}
            characterName={introDialogue[currentDialogue].character}
            onComplete={handleDialogueComplete}
          />
        </div>
      </div>
    )
  }

  // Render tutorial
  if (gameState === "tutorial") {
    return (
      <div className="min-h-screen bg-amber-50 p-6">
        <h1 className="text-3xl font-pixel text-amber-800 mb-6 text-center">Fraction Addition Tutorial</h1>

        {tutorialContent.map((section, index) => (
          <div key={index} className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-pixel text-amber-700 mb-4">{section.title}</h2>

            <div className="mb-4">
              <h3 className="text-lg font-pixel text-amber-600 mb-2">Steps:</h3>
              <ul className="list-disc pl-6 space-y-2">
                {section.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="text-amber-900">
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-100 p-4 rounded-md">
              <h3 className="text-lg font-pixel text-amber-600 mb-2">Example:</h3>
              <p className="font-bold mb-2">{section.example.problem}</p>
              <ol className="list-decimal pl-6 space-y-1">
                {section.example.solution.map((step, stepIndex) => (
                  <li key={stepIndex}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-6">
          <Button
            onClick={handleTutorialComplete}
            className="font-pixel bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg"
          >
            Start Practice
          </Button>
        </div>
      </div>
    )
  }

  // Render game
  if (gameState === "playing") {
    const currentQ = questions[currentQuestion]

    return (
      <div className="min-h-screen bg-amber-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="text-xl font-pixel text-amber-800">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="text-xl font-pixel text-amber-800">Score: {score}/100</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-pixel text-amber-700 mb-6 text-center">{currentQ.question}</h2>

            <div className="flex flex-col items-center space-y-4">
              <Input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
                className={`text-center text-xl w-48 ${
                  feedback === "correct"
                    ? "border-green-500 bg-green-50"
                    : feedback === "incorrect"
                      ? "border-red-500 bg-red-50"
                      : ""
                }`}
              />

              <Button
                onClick={handleSubmit}
                className="font-pixel bg-amber-600 hover:bg-amber-700 text-white px-6 py-2"
                disabled={feedback !== ""}
              >
                Submit
              </Button>
            </div>

            {feedback === "correct" && (
              <div className="mt-4 text-center text-green-600 font-pixel">Correct! Well done!</div>
            )}
            {feedback === "incorrect" && (
              <div className="mt-4 text-center text-red-600 font-pixel">
                Not quite right. Try again!
                <div className="text-amber-600 mt-2 text-sm">{currentQ.hint}</div>
              </div>
            )}
          </div>

          <div className="text-center text-amber-700">
            <div className="font-pixel">
              Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
            </div>
          </div>
        </div>

        <LevelCompletionPopup
          isOpen={showCompletionPopup}
          onClose={() => {
            setShowCompletionPopup(false)
            router.push("/student/game")
          }}
          levelId={levelId}
          levelName="Fraction Addition"
          score={score}
        />
      </div>
    )
  }

  // Render completion
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-pixel text-amber-800 mb-4">Game Completed!</h1>
        <p className="text-xl text-amber-700 mb-6">
          Final Score: {score}/100
          <br />
          Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
        </p>
        <Button
          onClick={() => router.push("/student/game")}
          className="font-pixel bg-amber-600 hover:bg-amber-700 text-white px-6 py-2"
        >
          Return to Map
        </Button>
      </div>
    </div>
  )
}
