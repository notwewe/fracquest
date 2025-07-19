"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type DialogueLine = {
  speaker: string
  text: string
  background?: string
  isChoice?: boolean
  choices?: string[]
}

type LevelProps = {
  levelId: string
  dialogue: DialogueLine[]
  onComplete: () => void
}

export function LevelContent({ levelId, dialogue, onComplete }: LevelProps) {
  const router = useRouter()
  const [currentLine, setCurrentLine] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [displayedText, setDisplayedText] = useState("")
  const [isCompleted, setIsCompleted] = useState(false)
  const supabase = createClient()
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [])

  // Handle dialogue text display
  useEffect(() => {
    if (currentLine >= dialogue.length) {
      handleComplete()
      return
    }

    // Reset state for new line
    setIsTyping(true)
    setDisplayedText("")

    // Get the full text for the current line
    const fullText = dialogue[currentLine].text
    let charIndex = 0

    // Clear any existing timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }

    // Function to type each character
    const typeNextChar = () => {
      if (charIndex < fullText.length) {
        // Use substring to ensure we get the complete text up to the current index
        setDisplayedText(fullText.substring(0, charIndex + 1))
        charIndex++
        typingTimerRef.current = setTimeout(typeNextChar, 30)
      } else {
        setIsTyping(false)
      }
    }

    // Start typing
    typeNextChar()

    // Clean up on line change
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [currentLine, dialogue])

  const handleNext = () => {
    if (isTyping) {
      // Skip typing animation
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
      setDisplayedText(dialogue[currentLine].text)
      setIsTyping(false)
    } else {
      // Go to next dialogue line
      setCurrentLine((prev) => prev + 1)
    }
  }

  const handleComplete = async () => {
    if (isCompleted) return

    setIsCompleted(true)

    try {
      // Mark level as completed in the database
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from("student_progress").upsert({
          student_id: user.id,
          waypoint_id: Number.parseInt(levelId),
          completed: true,
          score: 100, // Basic score for completing the level
        })
      }

      // Call the onComplete callback
      onComplete()
    } catch (error) {
      console.error("Error marking level as completed:", error)
    }
  }

  if (currentLine >= dialogue.length) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="text-white text-2xl font-pixel">Level completed!</div>
      </div>
    )
  }

  const currentDialogue = dialogue[currentLine]

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
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
            {currentDialogue.background || "Scene Background"}
          </div>
        </div>
      )}

      {/* Dialogue box */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 border-t-4 border-amber-800 p-6">
        <div className="text-amber-300 font-pixel text-lg mb-2">{currentDialogue.speaker}</div>
        <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px]">{displayedText}</div>

        {currentDialogue.isChoice ? (
          <div className="grid grid-cols-2 gap-4">
            {currentDialogue.choices?.map((choice, index) => (
              <Button
                key={index}
                onClick={handleNext}
                className="font-pixel bg-amber-600 hover:bg-amber-700 text-white"
              >
                {choice}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex justify-between">
            <Button onClick={handleNext} className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
              {isTyping ? "Skip" : "Next"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
