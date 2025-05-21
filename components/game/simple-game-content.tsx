"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import { LevelCompletionPopup } from "./level-completion-popup"
import { trackWaypointTime, updateStudentProgress } from "@/lib/time-tracking"

type GameProps = {
  studentId: string
  waypointId: number
  gameType: string
  onComplete?: () => void
  levelName?: string
}

export function SimpleGameContent({
  studentId,
  waypointId,
  gameType,
  onComplete,
  levelName = "Practice Game",
}: GameProps) {
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [totalQuestions] = useState(5) // 5 questions per game
  const [mistakes, setMistakes] = useState(0)
  const [score, setScore] = useState(20) // Start with max score
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const supabase = createClient()

  // Time tracking
  const startTimeRef = useRef<number>(Date.now())
  const lastTrackTimeRef = useRef<number>(Date.now())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Track time in chunks to avoid losing all time data if the user navigates away
  useEffect(() => {
    // Track time every 30 seconds
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const timeSpent = now - lastTrackTimeRef.current

      if (timeSpent > 1000) {
        // Only track if more than 1 second has passed
        trackWaypointTime(studentId, waypointId, timeSpent)
        lastTrackTimeRef.current = now
      }
    }, 30000) // 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Track final time when component unmounts
      const finalTime = Date.now() - lastTrackTimeRef.current
      if (finalTime > 1000) {
        trackWaypointTime(studentId, waypointId, finalTime)
      }
    }
  }, [studentId, waypointId])

  // Check if the game is already completed
  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data } = await supabase
            .from("student_progress")
            .select("*")
            .eq("student_id", user.id)
            .eq("waypoint_id", waypointId)
            .maybeSingle()

          if (data && data.completed) {
            setIsCompleted(true)
            if (data.score) {
              setScore(data.score)
            }
          }
        }
      } catch (error) {
        console.error("Error checking completion:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkCompletion()
  }, [waypointId, supabase])

  // Simulate game progress
  useEffect(() => {
    if (!isCompleted && !isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1
          if (newProgress >= 100) {
            clearInterval(interval)
            return 100
          }
          return newProgress
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [isCompleted, isLoading])

  // Update current question based on progress
  useEffect(() => {
    const questionProgress = Math.floor((progress / 100) * totalQuestions) + 1
    if (questionProgress <= totalQuestions) {
      setCurrentQuestion(questionProgress)
    }
  }, [progress, totalQuestions])

  // Simulate making a mistake randomly
  useEffect(() => {
    if (progress > 0 && progress < 100 && !isCompleted) {
      // 20% chance of making a mistake at certain progress points
      if (progress % 20 === 0 && Math.random() < 0.2) {
        setMistakes((prev) => {
          const newMistakes = prev + 1
          // Each mistake reduces score by 2 points
          setScore(Math.max(0, 20 - newMistakes * 2))
          return newMistakes
        })

        toast({
          title: "Oops!",
          description: "That wasn't quite right. Try again!",
          variant: "destructive",
        })
      }
    }
  }, [progress, isCompleted])

  const handleComplete = async () => {
    if (isCompleted || isLoading) return

    setIsLoading(true)

    // Calculate total time spent
    const totalTimeSpent = Math.round((Date.now() - startTimeRef.current) / 1000) // in seconds

    try {
      // Mark level as completed in the database
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await updateStudentProgress(studentId, waypointId, {
          completed: true,
          score: score, // Save the calculated score
          mistakes: mistakes,
          attempts: 0, // Assuming attempts are not tracked in the original code
          timeSpent: totalTimeSpent,
        })
      }

      setIsCompleted(true)

      // Show completion popup instead of toast
      setShowCompletionPopup(true)
    } catch (error) {
      console.error("Error marking game as completed:", error)
      toast({
        title: "Error",
        description: "An error occurred while saving your progress.",
        variant: "destructive",
      })
      // Still redirect even if there's an error
      router.push("/student/game")
    } finally {
      setIsLoading(false)
      // Clear the interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  // Handle attempt
  const handleAttempt = (isCorrect: boolean) => {
    setMistakes((prev) => prev + (isCorrect ? 0 : 1))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="bg-amber-900 bg-opacity-20 p-8 rounded-lg max-w-2xl w-full">
        <h1 className="text-3xl font-pixel text-amber-200 mb-6 text-center">{levelName}</h1>

        <div className="bg-gray-900 bg-opacity-80 p-6 rounded-lg border-2 border-amber-800 mb-8">
          <div className="flex justify-between items-center mb-4">
            <p className="text-white font-pixel">
              Question {currentQuestion} of {totalQuestions}
            </p>
            <p className="text-white font-pixel">Score: {score}/20</p>
          </div>

          <p className="text-white font-pixel mb-4">
            {isCompleted
              ? "You've already completed this game!"
              : `This is a placeholder for the ${gameType} gameplay. In the full implementation, this would be an interactive game.`}
          </p>

          <p className="text-amber-300 font-pixel mb-6">
            {isCompleted
              ? `Your final score was ${score}/20`
              : "For now, you can click the button below to simulate completing the game."}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-4 mb-6">
            <div
              className="bg-amber-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleComplete}
              className="font-pixel bg-amber-600 hover:bg-amber-700 text-white px-6 py-3"
              disabled={isLoading || isCompleted || progress < 100}
            >
              {isLoading
                ? "Saving progress..."
                : isCompleted
                  ? "Completed!"
                  : progress < 100
                    ? `In Progress (${progress}%)`
                    : "Complete Game"}
            </Button>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            onClick={() => router.push("/student/game")}
            className="font-pixel bg-gray-700 hover:bg-gray-800 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Map
          </Button>
        </div>
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
