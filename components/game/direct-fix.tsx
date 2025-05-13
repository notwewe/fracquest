"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

type DialogueLine = {
  speaker: string
  text: string
  background?: string
}

type DirectFixProps = {
  dialogue: DialogueLine[]
  onComplete: () => void
}

export function DirectFix({ dialogue, onComplete }: DirectFixProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const typingRef = useRef<NodeJS.Timeout | null>(null)

  const currentLine = dialogue[currentIndex]

  // Reset typing when dialogue changes
  useEffect(() => {
    if (typingRef.current) {
      clearTimeout(typingRef.current)
    }

    setIsTyping(true)
    setDisplayText("")

    let i = 0
    const fullText = currentLine.text

    function typeNextChar() {
      if (i < fullText.length) {
        setDisplayText(fullText.substring(0, i + 1))
        i++
        typingRef.current = setTimeout(typeNextChar, 30)
      } else {
        setIsTyping(false)
      }
    }

    typeNextChar()

    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current)
      }
    }
  }, [currentIndex, currentLine])

  const handleNext = () => {
    if (isTyping) {
      // Skip typing
      if (typingRef.current) {
        clearTimeout(typingRef.current)
      }
      setDisplayText(currentLine.text)
      setIsTyping(false)
    } else {
      // Go to next dialogue
      if (currentIndex < dialogue.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        onComplete()
      }
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Background */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-4xl text-amber-300 font-pixel">{currentLine.background || "Scene"}</div>
      </div>

      {/* Dialogue box */}
      <div className="bg-gray-900 border-t-4 border-amber-700 p-6">
        <div className="text-amber-400 font-pixel text-xl mb-2">{currentLine.speaker}</div>
        <div className="text-white font-pixel text-lg mb-4 whitespace-pre-wrap">{displayText}</div>

        <Button onClick={handleNext} className="bg-amber-600 hover:bg-amber-700 text-white font-pixel">
          {isTyping ? "Skip" : "Next"}
        </Button>
      </div>
    </div>
  )
}
