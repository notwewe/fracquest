"use client"

import { useState, useEffect, useRef } from "react"

type DialogueBoxProps = {
  text: string
  character?: string
  characterName?: string
  onComplete?: () => void
  typewriterSpeed?: number
}

export function DialogueBox({ text, characterName, onComplete, typewriterSpeed = 30 }: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const cursorTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      if (cursorTimerRef.current) clearInterval(cursorTimerRef.current)
    }
  }, [])

  // Typewriter effect
  useEffect(() => {
    // Reset state for new text
    setDisplayedText("")
    setIsComplete(false)

    // Clear any existing timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }

    let charIndex = 0

    // Function to type each character
    const typeNextChar = () => {
      if (charIndex < text.length) {
        // Use substring to ensure we get the complete text up to the current index
        setDisplayedText(text.substring(0, charIndex + 1))
        charIndex++
        typingTimerRef.current = setTimeout(typeNextChar, typewriterSpeed)
      } else {
        setIsComplete(true)
      }
    }

    // Start typing
    typeNextChar()

    // Clean up on text change
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [text, typewriterSpeed])

  // Blinking cursor effect
  useEffect(() => {
    if (isComplete) {
      // Clear any existing cursor timer
      if (cursorTimerRef.current) {
        clearInterval(cursorTimerRef.current)
      }

      // Start new cursor timer
      cursorTimerRef.current = setInterval(() => {
        setShowCursor((prev) => !prev)
      }, 500)

      // Clean up on completion change
      return () => {
        if (cursorTimerRef.current) {
          clearInterval(cursorTimerRef.current)
        }
      }
    }
  }, [isComplete])

  // Handle click to advance or skip
  const handleClick = () => {
    if (isComplete) {
      onComplete && onComplete()
    } else {
      // Skip to the end
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
      setDisplayedText(text)
      setIsComplete(true)
    }
  }

  return (
    <div className="dialogue-box relative w-full max-w-3xl mx-auto cursor-pointer" onClick={handleClick}>
      <div className="relative p-4 rounded-none bg-black bg-opacity-90 border-4 border-amber-700">
        {/* Pixel corners */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-amber-500"></div>
        <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-amber-500"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-amber-500"></div>

        {characterName && (
          <div className="text-amber-400 font-pixel text-lg mb-2 px-2 py-1 bg-black bg-opacity-70 inline-block">
            {characterName}
          </div>
        )}

        <div className="text-white text-lg font-pixel leading-relaxed whitespace-pre-wrap min-h-[80px]">
          {displayedText}
        </div>

        {isComplete && (
          <div className="absolute bottom-2 right-4">
            <span className={`text-amber-400 ${showCursor ? "opacity-100" : "opacity-0"}`}>▼</span>
          </div>
        )}
      </div>
    </div>
  )
}
