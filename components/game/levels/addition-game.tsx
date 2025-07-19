"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { LevelCompletionPopup } from "../level-completion-popup"
import BackroomsBackground from "./backrooms-bg"
import { gameContent } from "@/lib/game-content"

type AdditionProblem = {
  question: string
  answer: string
  choices: string[]
  correctIndex: number
}

const problems: AdditionProblem[] = [
  {
    question: "1/4 + 3/4",
    answer: "1",
    choices: ["4/4", "1", "4/8", "1/2"],
    correctIndex: 1,
  },
  {
    question: "1/3 + 1/6",
    answer: "1/2",
    choices: ["2/9", "1/2", "2/6", "3/6"],
    correctIndex: 1,
  },
  {
    question: "2/5 + 1/10",
    answer: "1/2",
    choices: ["3/15", "1/2", "3/10", "5/10"],
    correctIndex: 1,
  },
  {
    question: "3/8 + 1/4",
    answer: "5/8",
    choices: ["4/12", "5/8", "1/2", "3/4"],
    correctIndex: 1,
  },
  {
    question: "2/3 + 1/6",
    answer: "5/6",
    choices: ["3/9", "5/6", "2/6", "3/6"],
    correctIndex: 1,
  },
]

export default function AdditionGame() {
  const router = useRouter()
  const [currentProblem, setCurrentProblem] = useState(0)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [compassPieces, setCompassPieces] = useState(0)

  const supabase = createClient()

  const startGame = () => {
    setGameStarted(true)
    setCurrentProblem(0)
    setScore(0)
    setCompassPieces(0)
  }

  const handleAnswer = async (choiceIndex: number) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(choiceIndex)
    const problem = problems[currentProblem]
    const isCorrect = choiceIndex === problem.correctIndex

    if (isCorrect) {
      setScore(score + 20)
      setCompassPieces(compassPieces + 1)
      toast({
        title: "Correct!",
        description: `The compass piece glows! ${compassPieces + 1}/5 pieces restored.`,
        variant: "default",
      })
    } else {
      toast({
        title: "Incorrect",
        description: `The correct answer was ${problem.answer}. Try again!`,
        variant: "destructive",
      })
    }

    // Move to next problem after delay
    setTimeout(() => {
      if (currentProblem < problems.length - 1) {
        setCurrentProblem(currentProblem + 1)
        setSelectedAnswer(null)
      } else {
        endGame()
      }
    }, 2000)
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
          .eq("waypoint_id", 5)
          .maybeSingle()

        if (existingProgress) {
          // Update existing record only if new score is higher
          const newScore = Math.max(existingProgress.score || 0, score)
          const { error: updateError } = await supabase
            .from("student_progress")
            .update({
              completed: true,
              score: newScore,
              can_revisit: true,
              last_updated: new Date().toISOString(),
            })
            .eq("student_id", user.id)
            .eq("waypoint_id", 5)

          if (updateError) {
            console.error("Error updating progress:", updateError)
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase.from("student_progress").insert({
            student_id: user.id,
            waypoint_id: 5,
            completed: true,
            score: score,
            can_revisit: true,
            last_updated: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Error inserting progress:", insertError)
          }
        }
      }

      setShowCompletionPopup(true)
    } catch (error: any) {
      console.error("Error saving game progress:", error.message || error)
      // Still show completion popup even if save fails
      setShowCompletionPopup(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Backrooms background image */}
      <BackroomsBackground />
      {/* Squeaks character image - above background, below dialogue box */}
      <img
        src="/game characters/Squeaks.png"
        alt="Squeaks"
        style={{
          imageRendering: "pixelated",
          filter: "drop-shadow(0 0 12px #000)",
          transform: "scaleX(-1)",
          left: "32%",
          bottom: "32px",
          position: "absolute",
          width: "600px",
          height: "600px",
          zIndex: 15
        }}
        className="pointer-events-none"
      />
      {/* Overlay tint for ambience */}
      <div className="absolute inset-0 flex items-center justify-center bg-amber-900 bg-opacity-20 z-10">
        
      </div>

      {!gameStarted ? (
        // Start Screen - styled like dialogue box
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 border-t-4 border-amber-800 p-6 z-20">
          <div className="text-amber-300 font-pixel text-lg mb-2">Squeaks</div>
          <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px]">
            Welcome to the Compass Chamber! Here, you'll need to add fractions correctly to restore the magical Fraction
            Compass.
            {"\n\n"}
            Each correct answer will add a piece to the compass. Complete all five pieces to activate it!
            {"\n\n"}
            Remember, when adding fractions with the same denominator, just add the numerators. When the denominators
            are different, find a common denominator first.
          </div>
          <div className="flex justify-between">
            <Button onClick={startGame} className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
              Start Compass Restoration!
            </Button>
          </div>
        </div>
      ) : (
        // Game Screen - styled like dialogue box
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 border-t-4 border-amber-800 p-6 z-20">
          <div className="text-amber-300 font-pixel text-lg mb-2">
            Compass Pieces: {compassPieces}/5 | Score: {score}
          </div>
          <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px]">
            Restore the compass by solving this addition problem:
            {"\n\n"}
            <span className="text-3xl text-amber-300">{problems[currentProblem]?.question} = ?</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {problems[currentProblem]?.choices.map((choice, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`font-pixel ${
                  selectedAnswer === index
                    ? selectedAnswer === problems[currentProblem].correctIndex
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700"
                } text-white`}
                disabled={selectedAnswer !== null}
              >
                {choice}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Emergency exit button - always visible */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          onClick={() => router.push("/student/game")}
          className="font-pixel bg-red-600 hover:bg-red-700 text-white"
        >
          Exit
        </Button>
      </div>

      {/* Completion Popup */}
      <LevelCompletionPopup
        isOpen={showCompletionPopup}
        onClose={() => {
          setShowCompletionPopup(false)
          router.push("/student/game")
        }}
        levelId="5"
        levelName="Addition Game"
        score={score}
        isStory={false}
      />
    </div>
  )
}
