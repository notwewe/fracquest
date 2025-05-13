"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface DialogueLine {
  speaker: string
  text: string
  image?: string
}

interface StorySceneProps {
  title: string
  dialogues: DialogueLine[]
  onComplete?: () => void
  allowSkip?: boolean
  nextRoute?: string
}

export function StoryScene({ title, dialogues, onComplete, allowSkip = true, nextRoute }: StorySceneProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [displayedText, setDisplayedText] = useState("")
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
    if (currentIndex >= dialogues.length) {
      return
    }

    // Reset state for new line
    setIsTyping(true)
    setDisplayedText("")

    // Get the full text for the current line
    const fullText = dialogues[currentIndex].text
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

    // Clean up on index change
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [currentIndex, dialogues])

  const handleNext = async () => {
    if (isTyping) {
      // Skip typing animation
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
      setDisplayedText(dialogues[currentIndex].text)
      setIsTyping(false)
      return
    }

    if (currentIndex < dialogues.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      // Dialogue is complete
      if (onComplete) {
        onComplete()
      }

      if (nextRoute) {
        router.push(nextRoute)
      }
    }
  }

  const handleSkip = async () => {
    if (onComplete) {
      onComplete()
    }

    if (nextRoute) {
      router.push(nextRoute)
    }
  }

  const currentDialogue = dialogues[currentIndex]

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-2 border-amber-800 bg-amber-50">
        <CardContent className="p-6">
          <h2 className="text-2xl font-pixel text-amber-900 mb-4">{title}</h2>

          {/* Scene description - text only, no images */}
          <div className="mb-4 bg-amber-200 p-4 rounded-lg">
            <div className="text-center font-pixel text-amber-800">{currentDialogue.speaker}'s Scene</div>
          </div>

          <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-4">
            <div className="font-pixel text-amber-900 text-lg mb-2">{currentDialogue.speaker}:</div>
            <div className="font-pixel text-amber-800 min-h-[100px]">{displayedText}</div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {allowSkip && (
            <Button onClick={handleSkip} variant="outline" className="font-pixel border-amber-600 text-amber-700">
              Skip Scene
            </Button>
          )}
          <Button onClick={handleNext} className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
            {isTyping ? "Skip" : currentIndex < dialogues.length - 1 ? "Next" : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
