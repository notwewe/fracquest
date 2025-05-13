"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { X } from "lucide-react"

type DialogueLine = {
  speaker: string
  text: string
  background?: string
  isChoice?: boolean
  choices?: string[]
  correctChoice?: number // Index of the correct choice
}

type SimpleDialogueProps = {
  levelId: string
  dialogue: DialogueLine[]
}

export function SimpleDialogue({ levelId, dialogue }: SimpleDialogueProps) {
  const router = useRouter()
  const [currentLine, setCurrentLine] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const supabase = createClient()

  // Load saved progress when component mounts
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: progress } = await supabase
            .from("student_progress")
            .select("*")
            .eq("student_id", user.id)
            .eq("waypoint_id", Number.parseInt(levelId))
            .maybeSingle()

          if (progress && progress.current_line !== null && progress.current_line !== undefined) {
            setCurrentLine(progress.current_line)
          }
        }
      } catch (error) {
        console.error("Error loading progress:", error)
      }
    }

    loadProgress()
  }, [levelId, supabase])

  // Save progress when current line changes
  useEffect(() => {
    const saveProgress = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          await supabase.from("student_progress").upsert({
            student_id: user.id,
            waypoint_id: Number.parseInt(levelId),
            current_line: currentLine,
            completed: currentLine >= dialogue.length - 1,
            last_updated: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Error saving progress:", error)
      }
    }

    if (currentLine > 0) {
      saveProgress()
    }
  }, [currentLine, dialogue.length, levelId, supabase])

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === " " || e.key === "Enter") && !isLoading) {
        if (!dialogue[currentLine]?.isChoice) {
          e.preventDefault()
          handleNext()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isLoading, currentLine, dialogue])

  const handleNext = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      // If we're at the last line, mark as completed and navigate
      if (currentLine >= dialogue.length - 1) {
        await handleComplete()
      } else {
        // Otherwise, go to the next line
        setCurrentLine((prev) => prev + 1)
        setSelectedChoice(null) // Reset selected choice when moving to next line
      }
    } catch (error) {
      console.error("Error handling next:", error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChoiceSelect = async (choiceIndex: number) => {
    if (isLoading) return
    setIsLoading(true)
    setSelectedChoice(choiceIndex)

    try {
      const currentDialogue = dialogue[currentLine]

      // If there's a correct choice specified and this isn't it
      if (currentDialogue.correctChoice !== undefined && choiceIndex !== currentDialogue.correctChoice) {
        toast({
          title: "Incorrect",
          description: "That's not the right answer. Try again!",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // If we're at the last line, mark as completed and navigate
      if (currentLine >= dialogue.length - 1) {
        await handleComplete()
      } else {
        // Otherwise, go to the next line
        setCurrentLine((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error handling choice:", error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Mark the level as completed
        await supabase.from("student_progress").upsert({
          student_id: user.id,
          waypoint_id: Number.parseInt(levelId),
          completed: true,
          current_line: dialogue.length,
          score: 100,
          last_updated: new Date().toISOString(),
        })

        // Get the current waypoint
        const { data: waypoint } = await supabase.from("waypoints").select("*").eq("id", levelId).single()

        if (waypoint) {
          // Get all waypoints in this section
          const { data: waypoints } = await supabase
            .from("waypoints")
            .select("*")
            .eq("section_id", waypoint.section_id)
            .order("order_index")

          if (waypoints) {
            // Find the current waypoint index
            const currentIndex = waypoints.findIndex((w) => w.id.toString() === levelId)

            // If there's a next waypoint, navigate to it
            if (currentIndex < waypoints.length - 1) {
              const nextWaypoint = waypoints[currentIndex + 1]

              // Navigate based on waypoint type
              if (nextWaypoint.type === "intro" || nextWaypoint.type === "story") {
                router.push(`/student/game/level/${nextWaypoint.id}`)
              } else if (nextWaypoint.type === "game") {
                router.push(`/student/game/play/${nextWaypoint.id}`)
              } else if (nextWaypoint.type === "boss") {
                router.push(`/student/game/boss/${nextWaypoint.id}`)
              }
            } else {
              // If this is the last waypoint, go back to the game map
              router.push("/student/game")
            }
          }
        }
      }
    } catch (error) {
      console.error("Error completing level:", error)
      toast({
        title: "Error",
        description: "An error occurred while completing the level.",
        variant: "destructive",
      })
      router.push("/student/game")
    }
  }

  const handleExit = () => {
    router.push("/student/game")
  }

  // If we've gone past the end of the dialogue
  if (currentLine >= dialogue.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-white text-2xl font-pixel mb-8">Level completed!</div>
        <Button
          onClick={handleExit}
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
      {/* Exit button */}
      <Button
        onClick={handleExit}
        className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white"
        size="sm"
      >
        <X className="mr-1 h-4 w-4" />
        Exit
      </Button>

      {/* Background */}
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
                onClick={() => handleChoiceSelect(index)}
                className={`font-pixel ${
                  selectedChoice === index ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"
                } text-white`}
                disabled={isLoading || selectedChoice !== null}
              >
                {choice}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex justify-between">
            <Button
              onClick={handleNext}
              className="font-pixel bg-amber-600 hover:bg-amber-700 text-white"
              disabled={isLoading}
            >
              {currentLine < dialogue.length - 1 ? "Next" : "Complete"}
            </Button>
          </div>
        )}
      </div>

      {/* Debug info - only visible in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-0 left-0 bg-black bg-opacity-70 text-white p-2 text-xs">
          <div>
            Line: {currentLine + 1}/{dialogue.length}
          </div>
          <div>Loading: {isLoading ? "Yes" : "No"}</div>
          <div>Level ID: {levelId}</div>
          {currentDialogue.isChoice && (
            <div>
              Selected: {selectedChoice !== null ? selectedChoice : "None"}
              {currentDialogue.correctChoice !== undefined && ` (Correct: ${currentDialogue.correctChoice})`}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
