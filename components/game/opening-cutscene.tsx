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
  animation?: string
  videoBackground?: string
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
    background: "/auth/backgrounds/numeria-castle.png",
    character: "/pixel-characters/decimal-phantom-new.png",
    animation:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/output-onlinegiftools-ezgif.com-speed-d3Q9ZtnjLe88ddvrekAl25Lgu1ir2s.gif",
  },
  {
    speaker: "King Equalis",
    text: "Oh no! The Decimal Phantom has shattered the Fraction Orb! Without it, our kingdom will fall into mathematical chaos! We need a hero to restore balance!",
    videoBackground:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-7tHA9aALLNg7O7t21yXaklukoi77rF.mp4",
    character: "/pixel-characters/king-equalis-new.png",
  },
  {
    speaker: "Whiskers",
    text: "Your Majesty, I may be small, but I have a brave heart! I will journey across the land to collect the scattered orb fragments and restore peace to Numeria!",
    videoBackground:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-7tHA9aALLNg7O7t21yXaklukoi77rF.mp4",
    character: "/pixel-characters/whiskers-new.png",
  },
  {
    speaker: "King Equalis",
    text: "Brave Whiskers, take this magical compass! It will guide you to each fragment. Remember, understanding fractions is the key to defeating the Decimal Phantom. Good luck, young hero!",
    videoBackground:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-7tHA9aALLNg7O7t21yXaklukoi77rF.mp4",
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
  const videoRef = useRef<HTMLVideoElement>(null)

  const currentScene = storyScenes[currentSceneIndex]

  // Handle video playback when scene changes
  useEffect(() => {
    if (currentScene.videoBackground && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch((err) => console.error("Video playback failed:", err))
    }
  }, [currentSceneIndex, currentScene.videoBackground])

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
        
        .orb-glow {
          filter: drop-shadow(0 0 15px rgba(147, 51, 234, 0.7));
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.7;
          }
        }
        
        .pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Background - either image or video */}
      {currentScene.videoBackground ? (
        <div className="absolute inset-0 bg-black">
          <video
            ref={videoRef}
            src={currentScene.videoBackground}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            loop
          />
        </div>
      ) : (
        <div className="absolute inset-0">
          <Image
            src={currentScene.background || "/auth/backgrounds/numeria-castle.png"}
            alt="Scene background"
            fill
            className="object-cover"
            style={{ imageRendering: "pixelated" }}
            priority
          />
        </div>
      )}

      {/* Character - positioned lower */}
      {(currentScene.character || currentScene.speaker === "Squeaks") && (
        <div className="absolute left-24 bottom-[290px] z-10">
          <div className="relative">
            <Image
              src={
                currentScene.speaker === "Squeaks"
                  ? "/game characters/Squeaks.png"
                  : currentScene.character || "/placeholder.svg"
              }
              alt={currentScene.speaker}
              width={200}
              height={200}
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>
      )}

      {/* Animated Orb - centered and bigger */}
      {currentScene.animation && (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative orb-glow">
            <Image
              src={currentScene.animation || "/placeholder.svg"}
              alt="Fraction Orb"
              width={350}
              height={350}
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
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="relative w-full">
          {/* Dialog paper background - original height */}
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
            {/* Speaker name - using Blaka font */}
            <div className="absolute top-12 left-[196px] text-amber-800 font-blaka text-3xl">
              {currentScene.speaker}
            </div>

            {/* Dialogue text - normal size and weight */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black text-lg font-pixel leading-relaxed w-3/4 text-left pl-[196px]">
              {displayedText}
            </div>

            {/* Continue indicator - using Blaka font */}
            {showContinue && (
              <div className="absolute bottom-12 right-16">
                <div className="flex items-center">
                  <span className="text-amber-800 font-blaka text-xl pulse">Click to continue</span>
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
