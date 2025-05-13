"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { LevelCompletionPopup } from "./level-completion-popup"

type DialogueLine = {
  speaker: string
  text: string
  background?: string
  isChoice?: boolean
  choices?: string[]
  correctChoice?: number
  wrongAnswerText?: string
  wrongAnswerLine?: number // Index to jump to if answer is wrong
}

type LevelProps = {
  levelId: string
  dialogue: DialogueLine[]
  onComplete?: () => void
  levelName?: string
}

export function SimpleLevelContent({ levelId, dialogue, onComplete, levelName = "Story Level" }: LevelProps) {
  const router = useRouter()
  const [currentLine, setCurrentLine] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [skipNextLine, setSkipNextLine] = useState(false) // Add this to track if we should skip the next line
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const supabase = createClient()

  // Debug logging
  useEffect(() => {
    console.log("Current line:", currentLine)
    console.log("Dialogue length:", dialogue.length)
    console.log("Is completed:", isCompleted)
    console.log("Is button disabled:", isButtonDisabled)
    console.log("Wrong attempts:", wrongAttempts)
    console.log("Skip next line:", skipNextLine)
  }, [currentLine, dialogue.length, isCompleted, isButtonDisabled, wrongAttempts, skipNextLine])

  // Load the saved progress when component mounts
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Check if there's a saved progress for this waypoint
          const { data: progress } = await supabase
            .from("student_progress")
            .select("*")
            .eq("student_id", user.id)
            .eq("waypoint_id", Number.parseInt(levelId))
            .maybeSingle()

          // If there's saved progress, set the current line
          if (progress && progress.current_line !== null && progress.current_line !== undefined) {
            setCurrentLine(progress.current_line)
          }

          // If the level is already completed, mark it as such
          if (progress && progress.completed) {
            setIsCompleted(true)
          }
        }
      } catch (error) {
        console.error("Error loading progress:", error)
      }
    }

    loadProgress()
  }, [levelId, supabase])

  // Save progress whenever the current line changes
  useEffect(() => {
    const saveProgress = async () => {
      if (isSaving) return

      setIsSaving(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Save the current line to the database
          await supabase.from("student_progress").upsert({
            student_id: user.id,
            waypoint_id: Number.parseInt(levelId),
            current_line: currentLine,
            completed: isCompleted,
            last_updated: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Error saving progress:", error)
      } finally {
        setIsSaving(false)
      }
    }

    // Only save progress if we're not at the beginning
    if (currentLine > 0) {
      saveProgress()
    }
  }, [currentLine, isCompleted, levelId, supabase, isSaving])

  // This function determines if the current line is a wrong answer response that should be skipped
  const shouldSkipLine = (lineIndex: number) => {
    // If this is a line right after a choice question and we got the answer correct,
    // and the text starts with "Not quite" or similar phrases, skip it
    if (
      lineIndex > 0 &&
      dialogue[lineIndex - 1].isChoice &&
      (dialogue[lineIndex].text.startsWith("Not quite") ||
        dialogue[lineIndex].text.startsWith("That's not") ||
        dialogue[lineIndex].text.includes("correct answer is"))
    ) {
      return true
    }
    return false
  }

  const handleChoice = (choiceIndex: number) => {
    // Prevent multiple clicks
    if (isButtonDisabled) return
    setIsButtonDisabled(true)

    const currentDialogue = dialogue[currentLine]
    setSelectedChoice(choiceIndex)

    // If this is a choice dialogue with a correct answer
    if (currentDialogue.isChoice && currentDialogue.correctChoice !== undefined) {
      // If correct choice
      if (choiceIndex === currentDialogue.correctChoice) {
        // Move to next line after a short delay
        setTimeout(() => {
          // Skip the wrong answer line if it exists
          const nextLine = currentLine + 1
          if (shouldSkipLine(nextLine)) {
            setCurrentLine(nextLine + 1) // Skip the wrong answer line
          } else {
            setCurrentLine(nextLine) // Go to the next line normally
          }

          setWrongAttempts(0)
          setSelectedChoice(null)
          setIsButtonDisabled(false)
        }, 500)
      } else {
        // Wrong choice
        setWrongAttempts((prev) => prev + 1)

        // Show wrong answer feedback
        toast({
          title: "Incorrect",
          description: currentDialogue.wrongAnswerText || "That's not the correct answer. Try again!",
          variant: "destructive",
        })

        // If there's a specific wrong answer line to jump to
        if (currentDialogue.wrongAnswerLine !== undefined) {
          setTimeout(() => {
            setCurrentLine(currentDialogue.wrongAnswerLine)
            setWrongAttempts(0)
            setSelectedChoice(null)
            setIsButtonDisabled(false)
          }, 1000)
        }
        // After 3 wrong attempts, move on anyway
        else if (wrongAttempts >= 2) {
          setTimeout(() => {
            toast({
              title: "Moving on",
              description: "Let's continue with the story.",
              variant: "default",
            })
            // Skip to the line after the correct answer response
            const nextLine = currentLine + 2
            setCurrentLine(nextLine)
            setWrongAttempts(0)
            setSelectedChoice(null)
            setIsButtonDisabled(false)
          }, 1000)
        } else {
          // Re-enable buttons after a short delay
          setTimeout(() => {
            setSelectedChoice(null)
            setIsButtonDisabled(false)
          }, 1000)
        }
      }
    } else {
      // If it's not a choice with a correct answer, just move to the next line
      setTimeout(() => {
        setCurrentLine((prev) => prev + 1)
        setSelectedChoice(null)
        setIsButtonDisabled(false)
      }, 500)
    }
  }

  const handleNext = useCallback(() => {
    console.log("Next button clicked")

    // Temporarily disable the button to prevent double-clicks
    setIsButtonDisabled(true)

    // Go to next dialogue line
    if (currentLine < dialogue.length - 1) {
      // Check if the next line should be skipped
      const nextLine = currentLine + 1
      if (shouldSkipLine(nextLine)) {
        setCurrentLine(nextLine + 1) // Skip the wrong answer line
      } else {
        setCurrentLine(nextLine) // Go to the next line normally
      }
    } else {
      handleComplete()
    }

    // Re-enable the button after a short delay
    setTimeout(() => {
      setIsButtonDisabled(false)
    }, 300)
  }, [currentLine, dialogue.length])

  const handleComplete = async () => {
    console.log("Handling completion")
    if (isCompleted || isLoading) return

    setIsLoading(true)

    try {
      // Mark level as completed in the database
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        console.log("Marking level as completed for user:", user.id, "waypoint:", levelId)

        // First, check if a record already exists
        const { data: existingProgress } = await supabase
          .from("student_progress")
          .select("*")
          .eq("student_id", user.id)
          .eq("waypoint_id", Number.parseInt(levelId))
          .maybeSingle()

        let result

        if (existingProgress) {
          // If record exists, use update instead of upsert
          console.log("Existing progress found, updating...")
          result = await supabase
            .from("student_progress")
            .update({
              completed: true,
              current_line: dialogue.length,
              score: 100,
              last_updated: new Date().toISOString(),
            })
            .eq("student_id", user.id)
            .eq("waypoint_id", Number.parseInt(levelId))
        } else {
          // If no record exists, insert a new one
          console.log("No existing progress, inserting new record...")
          result = await supabase.from("student_progress").insert({
            student_id: user.id,
            waypoint_id: Number.parseInt(levelId),
            completed: true,
            current_line: dialogue.length,
            score: 100,
            last_updated: new Date().toISOString(),
          })
        }

        if (result.error) {
          console.error("Error saving completion status:", result.error)
          throw new Error(`Failed to save completion: ${result.error.message}`)
        }

        // Wait a moment to ensure the database has time to update
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Try to refresh the student_progress table
        try {
          await supabase.rpc("refresh_student_progress")
        } catch (error) {
          console.error("Error refreshing student progress:", error)
        }

        // Double-check that the level is marked as completed
        const { data: progress, error: checkError } = await supabase
          .from("student_progress")
          .select("*")
          .eq("student_id", user.id)
          .eq("waypoint_id", Number.parseInt(levelId))
          .single()

        if (checkError) {
          console.error("Error checking completion status:", checkError)
        }

        if (!progress || !progress.completed) {
          console.error("Level not marked as completed after save")

          // Try one more time with a direct update using RPC
          try {
            await supabase.rpc("force_complete_waypoint", {
              p_student_id: user.id,
              p_waypoint_id: Number.parseInt(levelId),
            })
            console.log("Forced completion via RPC")
          } catch (rpcError) {
            console.error("Error forcing completion via RPC:", rpcError)
          }
        } else {
          console.log("Level successfully marked as completed!")
        }
      }

      setIsCompleted(true)

      // Show completion popup instead of toast
      setShowCompletionPopup(true)
    } catch (error) {
      console.error("Error marking level as completed:", error)
      toast({
        title: "Error",
        description: "An error occurred while saving your progress.",
        variant: "destructive",
      })
      // Still redirect even if there's an error
      router.push("/student/game")
    } finally {
      setIsLoading(false)
    }
  }

  // Add keyboard event listener for spacebar and enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === " " || e.key === "Enter") && !isButtonDisabled) {
        e.preventDefault()

        const currentDialogue = dialogue[currentLine]
        if (!currentDialogue.isChoice) {
          handleNext()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleNext, isButtonDisabled, currentLine, dialogue])

  // Fallback if dialogue is empty
  if (!dialogue || dialogue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-white text-2xl font-pixel mb-8">No content available for this level.</div>
        <Button
          onClick={() => router.push("/student/game")}
          className="font-pixel bg-amber-600 hover:bg-amber-700 text-white"
        >
          Return to Game
        </Button>
      </div>
    )
  }

  // If we've gone past the end of the dialogue
  if (currentLine >= dialogue.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-white text-2xl font-pixel mb-8">Level completed!</div>
        <Button
          onClick={() => router.push("/student/game")}
          className="font-pixel bg-amber-600 hover:bg-amber-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Saving progress..." : "Return to Game"}
        </Button>
      </div>
    )
  }

  const currentDialogue = dialogue[currentLine]

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Background - text only */}
      <div className="absolute inset-0 flex items-center justify-center bg-amber-900 bg-opacity-20">
        <div className="w-full h-full flex items-center justify-center text-4xl font-pixel text-amber-200">
          {currentDialogue.background || "Fraction Practice"}
        </div>
      </div>

      {/* Dialogue box */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 border-t-4 border-amber-800 p-6">
        <div className="text-amber-300 font-pixel text-lg mb-2">{currentDialogue.speaker}</div>
        <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px]">
          {currentDialogue.text}
        </div>

        {currentDialogue.isChoice ? (
          <div className="grid grid-cols-2 gap-4">
            {currentDialogue.choices?.map((choice, index) => (
              <Button
                key={index}
                onClick={() => handleChoice(index)}
                className={`font-pixel ${
                  selectedChoice === index
                    ? selectedChoice === currentDialogue.correctChoice
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700"
                } text-white`}
                disabled={isButtonDisabled}
              >
                {choice}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex justify-between">
            <Button
              ref={buttonRef}
              onClick={handleNext}
              className="font-pixel bg-amber-600 hover:bg-amber-700 text-white"
              disabled={isButtonDisabled}
            >
              {currentLine < dialogue.length - 1 ? "Next" : "Complete"}
            </Button>
          </div>
        )}
      </div>

      {/* Debug info - only visible in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-0 right-0 bg-black bg-opacity-70 text-white p-2 text-xs">
          <div>
            Line: {currentLine + 1}/{dialogue.length}
          </div>
          <div>Button disabled: {isButtonDisabled ? "Yes" : "No"}</div>
          <div>Loading: {isLoading ? "Yes" : "No"}</div>
          <div>Saving: {isSaving ? "Yes" : "No"}</div>
          <div>Wrong attempts: {wrongAttempts}/3</div>
          <div>Selected choice: {selectedChoice !== null ? selectedChoice : "none"}</div>
          <div>Level ID: {levelId}</div>
          <div>Is Completed: {isCompleted ? "Yes" : "No"}</div>
          <div>Skip next line: {skipNextLine ? "Yes" : "No"}</div>
        </div>
      )}

      {/* Emergency exit button - always visible */}
      <div className="absolute top-4 right-4">
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
        levelId={levelId}
        levelName={levelName}
        score={100}
        isStory={true}
      />
    </div>
  )
}
