"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
    text: "In the mystical kingdom of Numeria, where numbers and fractions lived in perfect harmony, there stood a magnificent castle ruled by the wise King Equalis. The kingdom thrived on mathematical balance, where every fraction had its place in the grand equation of life.",
    background: "/auth/backgrounds/numeria-castle.png",
  },
  {
    speaker: "Narrator",
    text: "The Fraction Orb, a sacred artifact that maintained this balance, floated above the palace, radiating harmony and order. It was the source of all mathematical magic in Numeria, ensuring that fractions remained whole and complete.",
    background: "/auth/backgrounds/numeria-castle.png",
    animation: "/pixel-items/whole-orb.png",
  },
  {
    speaker: "Narrator",
    text: "But in the shadows lurked the Decimal Phantom, a creature of chaos who despised the order of fractions. He watched and waited, plotting to shatter the harmony that kept Numeria whole.",
    background: "/auth/backgrounds/numeria-castle.png",
    character: "/pixel-characters/decimal-phantom-new.png",
  },
  {
    speaker: "Decimal Phantom",
    text: "Hahaha! Finally, I have found the legendary Fraction Orb! With its power, I shall bring chaos to all mathematical order! No more will fractions rule supreme - decimals shall reign!",
    background: "/auth/backgrounds/numeria-castle.png",
    character: "/pixel-characters/decimal-phantom-new.png",
    animation: "/pixel-items/whole-orb.png",
  },
  {
    speaker: "Narrator",
    text: "With a terrible blast of dark energy, the Decimal Phantom shattered the Fraction Orb into countless pieces! The fragments scattered across the land, and chaos began to spread through Numeria.",
    background: "/auth/backgrounds/numeria-castle.png",
    character: "/pixel-characters/decimal-phantom-new.png",
    animation: "/game assets/orb-shatter.gif",
  },
  {
    speaker: "Narrator",
    text: "Bridges crumbled, buildings flickered between whole and broken states, and the very fabric of mathematical reality began to unravel. The kingdom was in grave danger!",
    videoBackground:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-7tHA9aALLNg7O7t21yXaklukoi77rF.mp4",
  },
  {
    speaker: "King Equalis",
    text: "Oh no! The Decimal Phantom has shattered the Fraction Orb! Without it, our kingdom will fall into mathematical chaos! The bridges are collapsing, buildings are breaking apart - we need a hero to restore balance!",
    videoBackground:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-7tHA9aALLNg7O7t21yXaklukoi77rF.mp4",
    character: "/pixel-characters/king-equalis-new.png",
  },
  {
    speaker: "King Equalis",
    text: "The orb fragments have scattered across the land. Each piece holds the power to restore order, but they must be collected and understood. Only someone who truly comprehends fractions can save us!",
    videoBackground:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-7tHA9aALLNg7O7t21yXaklukoi77rF.mp4",
    character: "/pixel-characters/king-equalis-new.png",
  },
  {
    speaker: "Whiskers",
    text: "Your Majesty, I may be small, but I have a brave heart and a curious mind! I've always been fascinated by how fractions work - how parts make up wholes. I will journey across the land to collect the scattered orb fragments and restore peace to Numeria!",
    videoBackground:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-7tHA9aALLNg7O7t21yXaklukoi77rF.mp4",
    character: "/pixel-characters/whiskers-new.png",
  },
  {
    speaker: "King Equalis",
    text: "Brave Whiskers, your courage and curiosity give me hope! Journey forth and seek the wisdom of the land's guardians. They will help you understand fractions and guide you to each fragment. Remember, every fraction tells a story of parts and wholes!",
    videoBackground:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-7tHA9aALLNg7O7t21yXaklukoi77rF.mp4",
    character: "/pixel-characters/king-equalis-new.png",
  },
  {
    speaker: "King Equalis",
    text: "You must visit the Fraction Forest, cross the Lessmore Bridge, explore the Realm of Balance, and face the challenges of Mixed Number Mountain. Each guardian will test your understanding of fractions in their own way. Good luck, young hero!",
    videoBackground:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-7tHA9aALLNg7O7t21yXaklukoi77rF.mp4",
    character: "/pixel-characters/king-equalis-new.png",
  },
  {
    speaker: "Narrator",
    text: "And so begins Whiskers' epic quest to restore the Fraction Orb and save the kingdom of Numeria. Armed with courage and a thirst for mathematical knowledge, our hero sets off into the unknown...",
    videoBackground:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-7tHA9aALLNg7O7t21yXaklukoi77rF.mp4",
  },
]

export function OpeningCutscene() {
  const router = useRouter()
  const supabase = createClient()
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [showContinue, setShowContinue] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const currentScene = storyScenes[currentSceneIndex]

  // Display full text immediately without typewriter effect
  useEffect(() => {
    setDisplayedText(currentScene.text)
    setShowContinue(true)
  }, [currentScene.text])

  // Handle video playback when scene changes
  useEffect(() => {
    if (currentScene.videoBackground && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch((err) => console.error("Video playback failed:", err))
    }
  }, [currentSceneIndex, currentScene.videoBackground])

  // Handle shaking effect after orb shattering
  useEffect(() => {
    // Start shaking during scene 4 (orb shattering) and continue for scenes 5-12
    if (currentSceneIndex >= 4) {
      setIsShaking(true)
    } else {
      setIsShaking(false)
    }
  }, [currentSceneIndex])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // No longer needed as typewriter is removed
    }
  }, [])

  // Typewriter effect - REMOVED
  // useEffect(() => {
  //   setDisplayedText("")
  //   setIsTyping(true)
  //   setShowContinue(false)

  //   if (typingTimerRef.current) {
  //     clearTimeout(typingTimerRef.current)
  //   }

  //   let charIndex = 0
  //   const fullText = currentScene.text

  //   const typeNextChar = () => {
  //     if (charIndex < fullText.length) {
  //       setDisplayedText(fullText.substring(0, charIndex + 1))
  //       charIndex++
  //       // Faster, more fluid typing speed
  //       typingTimerRef.current = setTimeout(typeNextChar, 20)
  //     } else {
  //       setIsTyping(false)
  //       setShowContinue(true)
  //     }
  //   }

  //   // Start typing after a brief delay
  //   typingTimerRef.current = setTimeout(typeNextChar, 300)

  //   return () => {
  //     if (typingTimerRef.current) {
  //       clearTimeout(typingTimerRef.current)
  //     }
  //   }
  // }, [currentSceneIndex, currentScene.text])

  const handleContinue = async () => {
    // No longer needed as typewriter is removed
    // if (isTyping) {
    //   // Skip to end of current text
    //   if (typingTimerRef.current) {
    //     clearTimeout(typingTimerRef.current)
    //   }
    //   setDisplayedText(currentScene.text)
    //   setIsTyping(false)
    //   setShowContinue(true)
    //   return
    // }

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
    <div className="min-h-screen w-full relative overflow-hidden">
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
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-3px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(3px);
          }
        }
        
        .shake {
          animation: shake 0.6s ease-in-out infinite;
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0">
        {currentScene.videoBackground ? (
          <video
            ref={videoRef}
            src={currentScene.videoBackground}
            className={`w-full h-full object-cover ${isShaking ? 'shake' : ''}`}
            autoPlay
            muted
            loop
            playsInline
            style={{ imageRendering: "pixelated" }}
          />
        ) : (
          <Image
            src={currentScene.background || "/auth/backgrounds/numeria-castle.png"}
            alt="Scene background"
            fill
            className={`object-cover ${isShaking ? 'shake' : ''}`}
            style={{ imageRendering: "pixelated" }}
            priority
          />
        )}
      </div>

      {/* Character */}
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
              width={400}
              height={400}
              style={{ 
                imageRendering: "pixelated",
                filter: "drop-shadow(0 0 12px #000)"
              }}
            />
          </div>
        </div>
      )}

      {/* Animated Orb */}
      {currentScene.animation && (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
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

      {/* Item (compass) */}
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

      {/* Dialogue box - exactly like other levels */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 border-t-4 border-amber-800 p-6">
        <div className="text-amber-300 font-pixel text-lg mb-2">{currentScene.speaker}</div>
        <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px]">
          {displayedText}
        </div>
        {showContinue && (
          <div className="flex justify-between">
            <Button onClick={handleContinue} className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
