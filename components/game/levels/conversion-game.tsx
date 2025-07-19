"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { LevelCompletionPopup } from "../level-completion-popup"
import { backgroundImages } from '@/lib/game-content'

type ConversionProblem = {
  type: "improper-to-mixed" | "mixed-to-improper"
  question: string
  answer: string
  improperFraction?: string
  mixedNumber?: string
}

const problems: ConversionProblem[] = [
  // Improper to Mixed
  { type: "improper-to-mixed", question: "9/4", answer: "2 1/4", improperFraction: "9/4" },
  { type: "improper-to-mixed", question: "11/3", answer: "3 2/3", improperFraction: "11/3" },
  { type: "improper-to-mixed", question: "13/5", answer: "2 3/5", improperFraction: "13/5" },
  { type: "improper-to-mixed", question: "17/6", answer: "2 5/6", improperFraction: "17/6" },
  { type: "improper-to-mixed", question: "15/4", answer: "3 3/4", improperFraction: "15/4" },

  // Mixed to Improper
  { type: "mixed-to-improper", question: "3 2/5", answer: "17/5", mixedNumber: "3 2/5" },
  { type: "mixed-to-improper", question: "2 3/4", answer: "11/4", mixedNumber: "2 3/4" },
  { type: "mixed-to-improper", question: "4 1/3", answer: "13/3", mixedNumber: "4 1/3" },
  { type: "mixed-to-improper", question: "1 5/6", answer: "11/6", mixedNumber: "1 5/6" },
  { type: "mixed-to-improper", question: "5 2/7", answer: "37/7", mixedNumber: "5 2/7" },
]

export default function ConversionGame(props: any) {
  const { params } = props || {};
  const router = useRouter()
  const [currentProblem, setCurrentProblem] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [streak, setStreak] = useState(0)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Shuffle problems for variety
  const [shuffledProblems, setShuffledProblems] = useState<ConversionProblem[]>([])

  useEffect(() => {
    const shuffled = [...problems].sort(() => Math.random() - 0.5)
    setShuffledProblems(shuffled)
  }, [])

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      endGame()
    }
  }, [gameStarted, gameEnded, timeLeft])

  const startGame = () => {
    setGameStarted(true)
    setCurrentProblem(0)
    setScore(0)
    setStreak(0)
    setTimeLeft(60)
    setUserAnswer("")
  }

  const checkAnswer = () => {
    const problem = shuffledProblems[currentProblem]
    const isCorrect = userAnswer.trim() === problem.answer

    if (isCorrect) {
      setScore(score + 10)
      setStreak(streak + 1)

      // Bonus for streak
      if (streak >= 4) {
        setScore(score + 20) // Bonus points
        setTimeLeft(timeLeft + 5) // Bonus time
        toast({
          title: "Perfect Streak!",
          description: "5 in a row! +5 seconds bonus time!",
          variant: "default",
        })
      } else {
        toast({
          title: "Correct!",
          description: "Great job converting that fraction!",
          variant: "default",
        })
      }
    } else {
      setStreak(0)
      toast({
        title: "Incorrect",
        description: `The correct answer was ${problem.answer}. Try the next one!`,
        variant: "destructive",
      })
    }

    // Move to next problem
    if (currentProblem < shuffledProblems.length - 1) {
      setCurrentProblem(currentProblem + 1)
      setUserAnswer("")
    } else {
      // Restart with new shuffled problems
      const newShuffled = [...problems].sort(() => Math.random() - 0.5)
      setShuffledProblems(newShuffled)
      setCurrentProblem(0)
      setUserAnswer("")
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
        // Check if record exists first
        const { data: existingProgress } = await supabase
          .from("student_progress")
          .select("*")
          .eq("student_id", user.id)
          .eq("waypoint_id", 3)
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
            .eq("waypoint_id", 3)

          if (updateError) {
            console.error("Error updating progress:", updateError)
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase.from("student_progress").insert({
            student_id: user.id,
            waypoint_id: 3,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userAnswer.trim() && !gameEnded) {
      checkAnswer()
    }
  }

  if (shuffledProblems.length === 0) {
    return (
      <div className="relative h-screen w-full bg-black overflow-hidden">
        {/* Background - same as story levels */}
        <div className="absolute inset-0 flex items-center justify-center bg-amber-900 bg-opacity-20">
          <div className="w-full h-full flex items-center justify-center text-4xl font-pixel text-amber-200">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background image - revert to original */}
      <div
        className="absolute inset-0 bg-contain bg-no-repeat bg-center z-0"
        style={{ backgroundImage: `url('${backgroundImages['Sorting Table']}')` }}
      />
      {/* Overlay for readability - revert to original */}
      <div className="absolute inset-0 bg-amber-900 bg-opacity-20 z-10" />
      {/* Foreground content */}
      <div className="relative z-20 min-h-screen w-full flex flex-col">
        {/* (Test button removed) */}
        {!gameStarted ? (
          // Start Screen - styled like dialogue box
          <div className="mt-auto mb-0 left-0 right-0 bg-gray-900 bg-opacity-80 border-t-4 border-amber-800 p-6">
            <div className="text-amber-300 font-pixel text-lg mb-2">Squeaks</div>
            <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px]">
              Welcome to the Sorting Table! Test your knowledge by converting fractions.
              {"\n\n"}• Convert improper fractions to mixed numbers (e.g., 9/4 = 2 1/4)
              {"\n"}• Convert mixed numbers to improper fractions (e.g., 3 2/5 = 17/5)
              {"\n"}• You have 60 seconds to score as many points as possible
              {"\n"}• Get 5 in a row for bonus time!
            </div>
            <div className="flex justify-between">
              <Button onClick={startGame} className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
                Start the Challenge!
              </Button>
            </div>
          </div>
        ) : (
          // Game Screen - styled like dialogue box
          <div className="mt-auto mb-8 left-1/2 w-full max-w-2xl bg-gray-900 bg-opacity-80 border-t-4 border-amber-800 p-6 rounded-2xl shadow-2xl z-20 mx-auto">
            <div className="text-amber-300 font-pixel text-lg mb-2">
              Score: {score} | Time: {timeLeft}s | Streak: {streak}
            </div>
            <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px]">
              {shuffledProblems[currentProblem]?.type === "improper-to-mixed"
                ? "Convert to Mixed Number:"
                : "Convert to Improper Fraction:"}
              {"\n\n"}
              <span className="text-3xl text-amber-300">{shuffledProblems[currentProblem]?.question}</span>
              {"\n\n"}
              {shuffledProblems[currentProblem]?.type === "improper-to-mixed" && (
                <span className="text-sm text-amber-400">
                  Hint: Divide {shuffledProblems[currentProblem]?.question.split("/")[0]} by {shuffledProblems[currentProblem]?.question.split("/")[1]}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center gap-4">
              <Input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your answer (e.g., 2 1/4 or 17/5)"
                className="text-lg max-w-md bg-gray-800 border-amber-600 text-white"
                disabled={gameEnded}
              />
              <Button
                onClick={checkAnswer}
                disabled={!userAnswer.trim() || gameEnded}
                className="font-pixel bg-amber-600 hover:bg-amber-700 text-white"
              >
                Submit
              </Button>
            </div>
          </div>
        )}

        {/* Emergency exit button - always visible */}
        <div className="absolute top-4 right-4 z-30">
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
          levelId="3"
          levelName="Conversion Game"
          score={score}
          isStory={false}
        />
      </div>
    </div>
  )
}
