"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const storyDialogue = [
  {
    speaker: "Narrator",
    text: "Welcome to Numeria, a land where balance is everything. But today... chaos has struck!",
    scene: "Kingdom of Numeria",
  },
  {
    speaker: "Decimal Phantom",
    text: "Mwahaha! With the Fraction Orb shattered, Numeria will never be whole again! Let's see you fix this, little adventurer!",
    scene: "The Shattering",
  },
  {
    speaker: "King Equalis",
    text: "Oh no! Without the Fraction Orb, our world is falling apart! Whiskers, you are our only hope. Retrieve the lost fraction pieces and restore Numeria!",
    scene: "Royal Throne Room",
  },
  {
    speaker: "Whiskers",
    text: "I won't let Numeria fall! I'll solve these fraction puzzles and save the kingdom!",
    scene: "Adventure Begins",
  },
  {
    speaker: "Narrator",
    text: "And so begins your adventure in Numeria. Are you ready to help Whiskers save the kingdom?",
    scene: "The Quest Map",
  },
]

export function StoryDialogue() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const supabase = createClient()

  const handleNext = async () => {
    if (currentIndex < storyDialogue.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      // Story is complete, update the database
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Check if story progress exists
          const { data: existingProgress } = await supabase
            .from("story_progress")
            .select("id")
            .eq("student_id", user.id)
            .single()

          if (existingProgress) {
            // Update existing record
            await supabase
              .from("story_progress")
              .update({
                has_seen_intro: true,
                last_dialogue_index: storyDialogue.length,
              })
              .eq("student_id", user.id)
          } else {
            // Create new record
            await supabase.from("story_progress").insert({
              student_id: user.id,
              has_seen_intro: true,
              last_dialogue_index: storyDialogue.length,
            })
          }
        }
      } catch (error) {
        console.error("Error updating story progress:", error)
      }

      // Redirect to student dashboard
      router.push("/student/dashboard")
    }
  }

  const handleSkip = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if story progress exists
        const { data: existingProgress } = await supabase
          .from("story_progress")
          .select("id")
          .eq("student_id", user.id)
          .single()

        if (existingProgress) {
          // Update existing record
          await supabase
            .from("story_progress")
            .update({
              has_seen_intro: true,
              last_dialogue_index: storyDialogue.length,
            })
            .eq("student_id", user.id)
        } else {
          // Create new record
          await supabase.from("story_progress").insert({
            student_id: user.id,
            has_seen_intro: true,
            last_dialogue_index: storyDialogue.length,
          })
        }
      }
    } catch (error) {
      console.error("Error updating story progress:", error)
    }

    // Redirect to student dashboard
    router.push("/student/dashboard")
  }

  const currentDialogue = storyDialogue[currentIndex]

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="border-2 border-amber-800 bg-amber-50 p-6 rounded-lg">
        <h2 className="text-2xl font-pixel text-amber-900 mb-4">The Legend of FracQuest</h2>

        {/* Scene description - text only */}
        <div className="mb-4 bg-amber-200 p-4 rounded-lg">
          <div className="text-center font-pixel text-amber-800">{currentDialogue.scene}</div>
        </div>

        <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-4">
          <div className="font-pixel text-amber-900 text-lg mb-2">{currentDialogue.speaker}:</div>
          <div className="font-pixel text-amber-800 min-h-[100px]">{currentDialogue.text}</div>
        </div>

        <div className="flex justify-between mt-4">
          <Button onClick={handleSkip} variant="outline" className="font-pixel border-amber-600 text-amber-700">
            Skip Story
          </Button>
          <Button onClick={handleNext} className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
            {currentIndex < storyDialogue.length - 1 ? "Next" : "Start Adventure"}
          </Button>
        </div>
      </div>
    </div>
  )
}
