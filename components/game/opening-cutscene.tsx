"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

interface StoryScene {
  speaker: string
  text: string
  background?: string
  character?: string
  item?: string
}

const storyScenes: StoryScene[] = [
  {
    speaker: "Narrator",
    text: "In the mystical kingdom of Numeria, where numbers and fractions lived in perfect harmony, there stood a magnificent castle ruled by the wise King Equalis.",
    background: "/auth/backgrounds/numeria-castle.png",
  },
  {
    speaker: "Decimal Phantom",
    text: "Hahaha! Finally, I have found the legendary Fraction Orb! With its power, I shall bring chaos to all mathematical order!",
    character: "/pixel-characters/decimal-phantom-new.png",
  },
  {
    speaker: "King Equalis",
    text: "Oh no! The Decimal Phantom has shattered the Fraction Orb! Without it, our kingdom will fall into mathematical chaos! We need a hero to restore balance!",
    character: "/pixel-characters/king-equalis-new.png",
  },
  {
    speaker: "Whiskers",
    text: "Your Majesty, I may be small, but I have a brave heart! I will journey across the land to collect the scattered orb fragments and restore peace to Numeria!",
    background: "/auth/backgrounds/numeria-castle.png",
    character: "/pixel-characters/whiskers-new.png",
  },
  {
    speaker: "King Equalis",
    text: "Brave Whiskers, take this magical compass! It will guide you to each fragment. Remember, understanding fractions is the key to defeating the Decimal Phantom. Good luck, young hero!",
    background: "/auth/backgrounds/numeria-castle.png",
    character: "/pixel-characters/king-equalis-new.png",
    item: "/pixel-items/magical-compass.png",
  },
]

export function OpeningCutscene() {
  const router = useRouter()
  const supabase = createClient()
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showContinue, setShowContinue] = useState(false)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const currentScene = storyScenes[currentSceneIndex]

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [])

  // Typewriter effect
  useEffect(() => {
    setDisplayedText("")
    setIsTyping(true)
    setShowContinue(false)

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }

    let charIndex = 0
    const fullText = currentScene.text

    const typeNextChar = () => {
      if (charIndex < fullText.length) {
        setDisplayedText(fullText.substring(0, charIndex + 1))
        charIndex++
        // Faster, more fluid typing speed
        typingTimerRef.current = setTimeout(typeNextChar, 20)
      } else {
        setIsTyping(false)
        setShowContinue(true)
      }
    }

    // Start typing after a brief delay
    typingTimerRef.current = setTimeout(typeNextChar, 300)

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [currentSceneIndex, currentScene.text])

  const handleContinue = async () => {
    if (isTyping) {
      // Skip to end of current text
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
      setDisplayedText(currentScene.text)
      setIsTyping(false)
      setShowContinue(true)
      return
    }

    if (currentSceneIndex < storyScenes.length - 1) {
      setCurrentSceneIndex((prev) => prev + 1)
    } else {
      // Story complete, mark as seen and redirect
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // First check if a record already exists for this student
          const { data: existingProgress } = await supabase
            .from("story_progress")
            .select("*")
            .eq("student_id", user.id)
            .maybeSingle()

          if (existingProgress) {
            // Update existing record
            await supabase
              .from("story_progress")
              .update({
                has_seen_intro: true,
                last_dialogue_index: storyScenes.length - 1,
              })
              .eq("student_id", user.id)
          } else {
            // Create new record only if one doesn't exist
            await supabase.from("story_progress").insert({
              student_id: user.id,
              has_seen_intro: true,
              last_dialogue_index: storyScenes.length - 1,
            })
          }
        }
      } catch (error) {
        console.error("Error updating story progress:", error)
      }

      router.push("/student/dashboard")
    }
  }

  // Handle click anywhere to continue
  const handleClick = () => {
    handleContinue()
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden cursor-pointer" onClick={handleClick}>
      <style jsx>{`
        @keyframes levitate {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        
        .levitate {
          animation: levitate 3s ease-in-out infinite;
        }
      `}</style>

      {/* Background */}
      {currentScene.background ? (
        <div className="absolute inset-0">
          <Image
            src={currentScene.background || "/placeholder.svg"}
            alt="Scene background"
            fill
            className="object-cover"
            style={{ imageRendering: "pixelated" }}
            priority
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-blue-900 to-black" />
      )}

      {/* Character - positioned lower */}
      {currentScene.character && (
        <div className="absolute left-24 bottom-[320px] z-10">
          <div className="relative">
            <Image
              src={currentScene.character || "/placeholder.svg"}
              alt={currentScene.speaker}
              width={200}
              height={200}
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>
      )}

      {/* Item (compass) with levitation animation */}
      {currentScene.item && (
        <div className="absolute left-[280px] bottom-[380px] z-10">
          <div className="relative levitate">
            <Image
              src={currentScene.item || "/placeholder.svg"}
              alt="Magical compass"
              width={100}
              height={100}
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>
      )}

      {/* Dialogue Box - spans full width at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="relative w-full">
          {/* Dialog paper background - increased height */}
          <div className="relative w-full h-[280px]">
            <Image
              src="/pixel-ui/dialog-paper4.png"
              alt="Dialog background"
              fill
              className="object-fill"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* Content overlay with better spacing */}
          <div className="absolute inset-0">
            {/* Speaker name - bigger and bolder */}
            <div className="absolute top-12 left-[196px] text-amber-800 font-pixel text-2xl font-black">
              {currentScene.speaker}
            </div>

            {/* Dialogue text - normal size and weight */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black text-lg font-pixel leading-relaxed w-3/4 text-left pl-[196px]">
              {displayedText}
            </div>

            {/* Continue indicator - positioned higher */}
            {showContinue && (
              <div className="absolute bottom-12 right-16">
                <div className="flex items-center">
                  <span className="text-amber-800 font-pixel text-sm">Click to continue</span>
                  <span className="text-amber-800 ml-2">▼</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
