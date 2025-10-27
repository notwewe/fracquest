"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { AnimatedClouds } from "./animated-clouds"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { LevelCompletionPopup } from "./level-completion-popup"
import CreditsScroll from "@/components/game/credits-scroll" // or use a placeholder if not present
import { backgroundImages } from "@/lib/game-content"

type DialogueLine = {
  speaker: string
  text: string
  background?: string
  isChoice?: boolean
  choices?: string[]
  correctChoice?: number
  wrongAnswerText?: string
  wrongAnswerLine?: number // Index to jump to if answer is wrong
  character?: string // Character image path
  characterStyle?: React.CSSProperties // Character image style
  assets?: { src: string; assetStyle?: React.CSSProperties }[] // Additional assets for the dialogue line
}

type LevelProps = {
  levelId: string
  dialogue: DialogueLine[]
  onComplete?: () => void
  levelName?: string
}

export function SimpleLevelContent({ levelId, dialogue, onComplete, levelName = "Story Level" }: LevelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentLine, setCurrentLine] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [skipNextLine, setSkipNextLine] = useState(false)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const supabase = createClient()

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

          // If there's saved progress and not completed, set the current line
          if (
            progress &&
            progress.current_line !== null &&
            progress.current_line !== undefined &&
            !progress.completed
          ) {
            setCurrentLine(progress.current_line)
          }

          // If the level is already completed, start from beginning but mark as completed
          if (progress && progress.completed) {
            setIsCompleted(true)
            setCurrentLine(0) // Always start from beginning for completed levels
          }
        }
      } catch (error) {
        console.error("Error loading progress:", error)
      }
    }

    loadProgress()
  }, [levelId])

  // Save progress whenever the current line changes (only if not completed)
  useEffect(() => {
    const saveProgress = async () => {
      if (isSaving || isCompleted) return

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

    // Only save progress if we're not at the beginning and not completed
    if (currentLine > 0 && !isCompleted) {
      saveProgress()
    }
  }, [currentLine, isCompleted, levelId, isSaving])

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
            // Fix: Ensure wrongAnswerLine is a number before setting state
            if (typeof currentDialogue.wrongAnswerLine === "number") {
              setCurrentLine(currentDialogue.wrongAnswerLine)
            } else {
              // Default to next line if wrongAnswerLine is undefined
              setCurrentLine(currentLine + 1)
            }
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
    if (isLoading) return

    setIsLoading(true)

    try {
      // Mark level as completed in the database (only if not already completed)
      if (!isCompleted) {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Check if record exists first
          const { data: existingProgress } = await supabase
            .from("student_progress")
            .select("*")
            .eq("student_id", user.id)
            .eq("waypoint_id", Number.parseInt(levelId))
            .maybeSingle()

          if (existingProgress) {
            // Update existing record
            const { error: updateError } = await supabase
              .from("student_progress")
              .update({
                completed: true,
                current_line: dialogue.length,
                score: 100,
                last_updated: new Date().toISOString(),
              })
              .eq("student_id", user.id)
              .eq("waypoint_id", Number.parseInt(levelId))

            if (updateError) {
              console.error("Error updating progress:", updateError)
            }
          } else {
            // Insert new record
            const { error: insertError } = await supabase.from("student_progress").insert({
              student_id: user.id,
              waypoint_id: Number.parseInt(levelId),
              completed: true,
              current_line: dialogue.length,
              score: 100,
              last_updated: new Date().toISOString(),
            })

            if (insertError) {
              console.error("Error inserting progress:", insertError)
            }
          }

          // Wait a moment to ensure the database has time to update
          await new Promise((resolve) => setTimeout(resolve, 500))

          // Try to refresh the student_progress table
          try {
            await supabase.rpc("refresh_student_progress")
          } catch (error) {
            console.error("Error refreshing student progress:", error)
          }
        }
      }

      setIsCompleted(true)

      if (levelId === "11") {
        setShowCredits(true)
      } else {
        setShowCompletionPopup(true)
      }
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

  const handleRestart = () => {
    setCurrentLine(0)
    setIsCompleted(false)
    setWrongAttempts(0)
    setSelectedChoice(null)
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

  // After dialogue, render credits if showCredits is true and levelId is 11
  if (showCredits && levelId === "11") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        {/* Replace with your actual credits scroll component */}
        <CreditsScroll />
      </div>
    )
  }

  const currentDialogue = dialogue[currentLine]

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Render animated clouds for bg1 scenes */}
      {currentDialogue.background === "bg1" && <AnimatedClouds />}
      {/* Background - show image for 'Fraction Emporium Test', otherwise text */}
      {currentDialogue.background === "Fraction Emporium Test" ? (
        <div className="absolute inset-0">
          <img
            src="/game-backgrounds/testimage.jpg"
            alt="Fraction Emporium Test Background"
            className="w-full h-full object-cover"
            style={{ zIndex: 0 }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-amber-900 bg-opacity-20">
          <div className="w-full h-full flex items-center justify-center text-4xl font-pixel text-amber-200">
            {currentDialogue.background || "Fraction Practice"}
          </div>
        </div>
      )}

      {/* Background image if available */}
      {currentDialogue.background && backgroundImages[currentDialogue.background] ? (
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url('${backgroundImages[currentDialogue.background]}')` }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-amber-900 bg-opacity-20 z-0">
          <div className="w-full h-full flex items-center justify-center text-4xl font-pixel text-amber-200">
            {currentDialogue.background || "Fraction Practice"}
          </div>
        </div>
      )}

      {/* Character image if present - fixed position, above background, below dialogue box */}
      {currentDialogue.character && (
        <img
          src={currentDialogue.character}
          alt={currentDialogue.speaker}
          width={600}
          height={600}
          style={currentDialogue.characterStyle || {
            imageRendering: "pixelated",
            filter: "drop-shadow(0 0 12px #000)",
            transform: "scaleX(-1)"
          }}
        />
      )}
      {/* Additional assets if present */}
      {currentDialogue.assets &&
        currentDialogue.assets.map((asset, idx) => (
          <img
            key={idx}
            src={asset.src}
            alt={`asset-${idx}`}
            style={asset.assetStyle}
          />
        ))}

      {/* Dialogue box */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 border-t-4 border-amber-800 p-6 z-30">
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

      {/* Emergency exit button - always visible */}
      <div className="absolute top-4 right-4">
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

      {/* Completion Popup */}
      {levelId !== "11" && (
        <LevelCompletionPopup
          isOpen={showCompletionPopup}
          onClose={() => {
            setShowCompletionPopup(false)
            const location = searchParams.get('location') || 'arithmetown';
            router.push(`/student/game?location=${location}`);
          }}
          levelId={levelId}
          levelName={levelName}
          score={100}
          isStory={true}
        />
      )}
    </div>
  )
}
