"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { LevelCompletionPopup } from "../level-completion-popup"
import { backgroundImages } from '@/lib/game-content'
import { updateStudentProgress } from "@/lib/update-progress"

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
  const searchParams = useSearchParams()
  // Scoring logic
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [currentProblem, setCurrentProblem] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [passed, setPassed] = useState(false)
  // Replace questionMistakes with mistakes
  const [mistakes, setMistakes] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const [timeLeft, setTimeLeft] = useState(60)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)

  // Shuffle problems for variety
  const [shuffledProblems, setShuffledProblems] = useState<ConversionProblem[]>([])

  useEffect(() => {
    const shuffled = [...problems].sort(() => Math.random() - 0.5)
    setShuffledProblems(shuffled)
  }, [])

  useEffect(() => {
    if (gameStarted && !gameEnded && !gameOver && timeLeft > 0 && score < 100) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStarted && !gameEnded && !gameOver) {
      if (score >= 60) {
        setPassed(true)
        endGame(); // Ensure DB update and popup
      } else {
        setGameOver(true)
      }
    } else if (score >= 100 && gameStarted && !gameEnded && !gameOver) {
      setPassed(true)
      endGame(); // Ensure DB update and popup
    }
  }, [gameStarted, gameEnded, gameOver, timeLeft, score])

  const startGame = () => {
    setGameStarted(true)
    setCurrentProblem(0)
    setScore(0)
    setStreak(0)
    setMaxStreak(0)
    setUserAnswer("")
    // In startGame, reset mistakes to 0
    setMistakes(0)
    setFeedback(null)
    setGameEnded(false)
    setGameOver(false)
    setPassed(false)
    setTimeLeft(60)
  }

  const checkAnswer = () => {
    const problem = shuffledProblems[currentProblem]
    const isCorrect = userAnswer.trim() === problem.answer

    if (isCorrect) {
      let newStreak = streak + 1
      let newScore = score + 20
      setStreak(newStreak)
      setScore(newScore)
      setMaxStreak(Math.max(maxStreak, newStreak))
      // REMOVE: setQuestionMistakes(0)
      setFeedback(null)
      if (newStreak === 3) {
        setTimeLeft((prev) => prev + 10)
        toast({
          title: "Streak Bonus!",
          description: "3 in a row! +10 seconds!",
          variant: "default",
        })
      }
      if (newStreak === 5) {
        toast({
          title: "Streak Bonus!",
          description: "5 in a row! Bonus points!",
          variant: "default",
        })
      }
      // Next question
      if (currentProblem < shuffledProblems.length - 1) {
        setCurrentProblem(currentProblem + 1)
        setUserAnswer("")
      } else {
        // End of questions
        if (newScore >= 60) {
          setPassed(true)
          endGame();
        } else {
          setGameOver(true)
        }
      }
    } else {
      // Streak broken
      setStreak(0)
      setMistakes((prev) => {
        const newMistakes = prev + 1
        if (newMistakes >= 3) {
          setGameOver(true)
          setGameEnded(true)
          setShowCompletionPopup(true)
          setFeedback(null)
        } else {
          setFeedback("Incorrect. Try again!")
        }
        return newMistakes
      })
      toast({
        title: "Incorrect",
        description: `The correct answer was ${problem.answer}. Try again!`,
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
        await updateStudentProgress(user.id, 3, {
          completed: true,
          score: score,
        })
      }
      setShowCompletionPopup(true)
    } catch (error: any) {
      console.error("Error saving game progress:", error.message || error)
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

  // Remove the renderGameOver function and the if (gameOver) return renderGameOver();
  // Only use LevelCompletionPopup for both pass and fail/game over states

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
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        {/* (Test button removed) */}
        {!gameStarted ? (
          // Start Screen - styled like dialogue box at the bottom
          <div className="absolute bottom-0 left-0 right-0 w-full bg-gray-900 bg-opacity-80 border-t-4 border-amber-800 p-6 shadow-2xl flex flex-col items-start justify-center">
            <div className="text-amber-300 font-pixel text-lg mb-2 text-left w-full">Squeaks</div>
            <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px] text-left w-full">
              <span>Welcome to the Sorting Table! Test your knowledge by converting fractions.</span>
              <ul className="list-disc pl-6 mt-4">
                <li>Convert improper fractions to mixed numbers (e.g., 9/4 = 2 1/4)</li>
                <li>Convert mixed numbers to improper fractions (e.g., 3 2/5 = 17/5)</li>
                <li>You have 60 seconds to score as many points as possible</li>
                <li>Get 3 in a row for bonus time!</li>
              </ul>
            </div>
            <div className="flex justify-start w-full">
              <Button onClick={startGame} className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
                Start the Challenge!
              </Button>
            </div>
          </div>
        ) : (
          // Game Screen - styled like dialogue box
          <div className="w-full max-w-2xl bg-gray-900 bg-opacity-80 border-t-4 border-amber-800 p-6 rounded-2xl shadow-2xl mx-auto flex flex-col items-center justify-center">
            <div className="text-amber-300 font-pixel text-lg mb-2">
              Score: {score} | Streak: {streak} | Time: {timeLeft}s
            </div>
            <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px] text-center">
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
            <div className="flex justify-center items-center gap-4 w-full">
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
      </div>
      {feedback && (
        <div className="text-center mt-4">
          <span className={`font-pixel text-lg ${feedback.startsWith('Correct') ? 'text-green-600' : feedback.startsWith('Incorrect') ? 'text-red-600' : feedback.startsWith('Game over') ? 'text-red-600' : 'text-amber-600'}`}>{feedback}</span>
        </div>
      )}

      {/* Emergency exit button - always visible */}
      <div className="absolute top-4 right-4 z-30">
        <Button
          onClick={() => {
            const location = searchParams.get('location') || 'arithmetown';
            router.push(`/student/game?location=${location}`);
          }}
          className="font-pixel bg-red-600 hover:bg-red-700 text-white"
        >
          Exit
        </Button>
      </div>

      {/* Add a healthbar in the top left */}
      {gameStarted && !gameEnded && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-gray-800 rounded-full px-4 py-2 flex items-center">
            <span className="font-pixel text-amber-200 mr-2">Mistakes</span>
            <div className="w-24 h-4 bg-red-200 rounded-full overflow-hidden">
              <div className="h-4 bg-red-600 rounded-full transition-all duration-300" style={{ width: `${(mistakes/3)*100}%` }}></div>
            </div>
            <span className="font-pixel text-amber-200 ml-2">{mistakes}/3</span>
          </div>
        </div>
      )}

      {/* Completion Popup */}
      <LevelCompletionPopup
        isOpen={showCompletionPopup}
        onClose={() => {
          setShowCompletionPopup(false)
          const location = searchParams.get('location') || 'arithmetown';
          router.push(`/student/game?location=${location}`);
        }}
        onRetry={() => {
          setShowCompletionPopup(false);
          setGameOver(false);
          setGameEnded(false);
          setPassed(false);
          setMistakes(0);
          setFeedback(null);
          setGameStarted(false);
          setScore(0);
          setStreak(0);
          setUserAnswer("");
          setCurrentProblem(0);
        }}
        levelId="3"
        levelName="Conversion Game"
        score={score}
        isGameOver={gameOver}
        isStory={false}
        passed={passed}
      />
    </div>
  )
}
