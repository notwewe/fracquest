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
          if (score >= 60) {
            setPassed(true)
            setGameEnded(true)
          } else {
            setGameOver(true)
          }
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

  // Add a renderGameOver function
  const renderGameOver = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="bg-red-100 p-8 rounded-lg border-4 border-red-600 shadow-lg text-center">
        <h2 className="text-3xl font-pixel text-red-800 mb-4">Game Over</h2>
        <p className="text-lg font-pixel text-red-700 mb-6">You made 3 mistakes on the same question.</p>
        <Button onClick={() => { setGameOver(false); setGameEnded(false); setCurrentProblem(0); setStreak(0); setUserAnswer(""); setMistakes(0); setFeedback(null); setGameStarted(false); }} className="font-pixel bg-red-600 hover:bg-red-700 text-white text-xl px-8 py-4">Retry</Button>
      </div>
    </div>
  )

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Background - same as story levels */}
      <div className="absolute inset-0 flex items-center justify-center bg-amber-900 bg-opacity-20">
        <div className="w-full h-full flex items-center justify-center text-4xl font-pixel text-amber-200">
          Squeaks' Sorting Table
        </div>
      </div>

      {!gameStarted ? (
        // Start Screen - styled like dialogue box
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 border-t-4 border-amber-800 p-6">
          <div className="text-amber-300 font-pixel text-lg mb-2">Squeaks</div>
          <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px]">
            Convert between improper fractions and mixed numbers.
            {"\n\n"}
            • You have 1 minute.
            {"\n"}• 3 correct answers in a row: +10 seconds.
            {"\n"}• 3 mistakes: game over.
            {"\n"}• Reach 100 points or run out of time to finish.
          </div>
          <div className="flex justify-between">
            <Button onClick={startGame} className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
              Start the Challenge!
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Game Screen - styled like dialogue box */}
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 border-t-4 border-amber-800 p-6">
            <div className="text-amber-300 font-pixel text-lg mb-2">
              Score: {score} | Streak: {streak} | Time: {timeLeft}s
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
          {feedback && (
            <div className="text-center mt-4">
              <span className={`font-pixel text-lg ${feedback.startsWith('Correct') ? 'text-green-600' : feedback.startsWith('Incorrect') ? 'text-red-600' : feedback.startsWith('Game over') ? 'text-red-600' : 'text-amber-600'}`}>{feedback}</span>
            </div>
          )}
        </>
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
          router.push("/student/game")
        }}
        onRetry={() => {
          setGameOver(false); setGameEnded(false); setPassed(false); setCurrentProblem(0); setStreak(0); setUserAnswer(""); setMistakes(0); setFeedback(null); setGameStarted(false);
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
