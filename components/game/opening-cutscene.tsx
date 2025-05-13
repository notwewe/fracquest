"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function OpeningCutscene() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const supabase = createClient()
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const dialogue = [
    {
      speaker: "Narrator",
      text: "Long ago, in the magical kingdom of Numeria, numbers and mathematics brought harmony and prosperity to all.",
    },
    {
      speaker: "Narrator",
      text: "At the heart of the kingdom stood the Fraction Orb, a powerful artifact that maintained balance between all forms of numbers.",
    },
    {
      speaker: "Narrator",
      text: "But one fateful day, the Decimal Phantom, jealous of the kingdom's prosperity, infiltrated the royal vault.",
    },
    {
      speaker: "Decimal Phantom",
      text: "Why should fractions hold such power? Decimals are superior! I shall destroy this orb and bring chaos to Numeria!",
    },
    {
      speaker: "Narrator",
      text: "With a powerful spell, the Phantom shattered the Fraction Orb into pieces, scattering them across the land.",
    },
    {
      speaker: "Narrator",
      text: "As the orb shattered, mathematical chaos ensued. Numbers became unstable, equations faltered, and the kingdom began to crumble.",
    },
    {
      speaker: "King Equalis",
      text: "This is terrible! Without the Fraction Orb, our kingdom will fall into mathematical disorder!",
    },
    {
      speaker: "King Equalis",
      text: "We must find a hero who understands the power of fractions to recover the fragments and restore balance to our realm.",
    },
    {
      speaker: "Narrator",
      text: "And that's where you come in, brave adventurer. The kingdom needs your mathematical prowess to save it from chaos.",
    },
    {
      speaker: "Narrator",
      text: "Your journey begins now. Are you ready to master fractions and save the kingdom of Numeria?",
    },
  ]

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
    if (currentStep >= dialogue.length) {
      return
    }

    // Reset state for new step
    setIsTyping(true)
    setDisplayedText("")

    // Get the full text for the current step
    const fullText = dialogue[currentStep].text
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

    // Clean up on step change
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [currentStep, dialogue])

  const handleNext = () => {
    if (isTyping) {
      // Skip typing animation
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
      setDisplayedText(dialogue[currentStep].text)
      setIsTyping(false)
    } else if (currentStep < dialogue.length - 1) {
      // Go to next dialogue step
      setCurrentStep((prev) => prev + 1)
    } else {
      // Complete the intro
      handleComplete()
    }
  }

  const handleComplete = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Mark the intro as seen
        await supabase.from("story_progress").upsert({
          student_id: user.id,
          has_seen_intro: true,
        })
      }

      // Redirect to the student map
      router.push("/student/map")
    } catch (error) {
      console.error("Error updating story progress:", error)
      router.push("/student/map")
    }
  }

  if (currentStep >= dialogue.length) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-pixel text-amber-900 mb-4">Your adventure begins!</h2>
          <Button
            onClick={() => router.push("/student/map")}
            className="font-pixel bg-amber-600 hover:bg-amber-700 text-white"
          >
            Start Your Quest
          </Button>
        </div>
      </div>
    )
  }

  const currentDialogue = dialogue[currentStep]

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="border-2 border-amber-800 bg-amber-50 p-6 rounded-lg">
        <h2 className="text-2xl font-pixel text-amber-900 mb-4">The Legend of FracQuest</h2>

        {/* Background - text only, no images */}
        <div className="mb-4 bg-amber-200 p-4 rounded-lg">
          <div className="text-center font-pixel text-amber-800">
            {currentStep <= 1
              ? "Kingdom of Numeria"
              : currentStep <= 3
                ? "The Decimal Phantom"
                : currentStep <= 5
                  ? "The Shattering"
                  : currentStep <= 7
                    ? "Royal Throne Room"
                    : "The Hero's Call"}
          </div>
        </div>

        <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-4">
          <div className="font-pixel text-amber-900 text-lg mb-2">{currentDialogue.speaker}:</div>
          <div className="font-pixel text-amber-800 min-h-[100px]">{displayedText}</div>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handleNext} className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
            {isTyping ? "Skip" : currentStep < dialogue.length - 1 ? "Next" : "Begin Adventure"}
          </Button>
        </div>
      </div>
    </div>
  )
}
