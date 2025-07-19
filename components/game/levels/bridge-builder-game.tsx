"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { LevelCompletionPopup } from "../level-completion-popup"
import { getLevelDialogue } from "@/lib/game-content"
import FixedLessMooreBridgeBackground from "./fixed-lessmoore-bridge-bg"
import LessmoreBridgeBackground from "./lessmore-bridge-bg"

type SubtractionProblem = {
  question: string
  answer: string
  hint: string
}

const bridgeProblems: SubtractionProblem[] = [
  {
    question: "7/8 - 3/8",
    answer: "1/2",
    hint: "Same denominators - subtract numerators: 7 - 3 = 4, so 4/8 = 1/2",
  },
  {
    question: "5/6 - 1/3",
    answer: "1/2",
    hint: "Find common denominator 6: 1/3 = 2/6, then 5/6 - 2/6 = 3/6 = 1/2",
  },
  {
    question: "4/5 - 1/10",
    answer: "7/10",
    hint: "Find common denominator 10: 4/5 = 8/10, then 8/10 - 1/10 = 7/10",
  },
  {
    question: "1 - 1/4",
    answer: "3/4",
    hint: "Convert 1 to 4/4, then 4/4 - 1/4 = 3/4",
  },
  {
    question: "2/3 - 1/6",
    answer: "1/2",
    hint: "Find common denominator 6: 2/3 = 4/6, then 4/6 - 1/6 = 3/6 = 1/2",
  },
]

export default function BridgeBuilderGame() {
  const router = useRouter()
  const [currentProblem, setCurrentProblem] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [bridgeStones, setBridgeStones] = useState(0)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPostGameDialogue, setShowPostGameDialogue] = useState(false)
  const [postGameIndex, setPostGameIndex] = useState(0)
  const supabase = createClient()

  const startGame = () => {
    setGameStarted(true)
    setCurrentProblem(0)
    setScore(0)
    setBridgeStones(0)
    setUserAnswer("")
  }

  const checkAnswer = () => {
    const problem = bridgeProblems[currentProblem]
    const isCorrect = userAnswer.trim() === problem.answer

    if (isCorrect) {
      setScore(score + 20)
      setBridgeStones(bridgeStones + 1)

      toast({
        title: "Correct!",
        description: `Bridge stone ${bridgeStones + 1} appears!`,
        variant: "default",
      })

      // Check if bridge is complete (5 stones)
      if (bridgeStones + 1 >= 5) {
        setTimeout(() => {
          endGame()
        }, 1500)
        return
      }

      // Move to next problem
      setTimeout(() => {
        setCurrentProblem(currentProblem + 1)
        setUserAnswer("")
      }, 1500)
    } else {
      toast({
        title: "Incorrect",
        description: problem.hint,
        variant: "destructive",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userAnswer.trim() && !gameEnded) {
      checkAnswer()
    }
  }

  const endGame = async () => {
    setGameEnded(true)
    setIsLoading(true)
    setShowPostGameDialogue(true)
    setPostGameIndex(0)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if record exists first
        const { data: existingProgress } = await supabase
          .from("student_progress")
          .select("*")
          .eq("student_id", user.id)
          .eq("waypoint_id", 7)
          .maybeSingle()

        if (existingProgress) {
          // Update existing record only if new score is higher
          const newScore = Math.max(existingProgress.score || 0, score)
          const { error: updateError } = await supabase
            .from("student_progress")
            .update({
              completed: true,
              score: newScore,
              can_revisit: true,
              last_updated: new Date().toISOString(),
            })
            .eq("student_id", user.id)
            .eq("waypoint_id", 7)

          if (updateError) {
            console.error("Error updating progress:", updateError)
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase.from("student_progress").insert({
            student_id: user.id,
            waypoint_id: 7,
            completed: true,
            score: score,
            can_revisit: true,
            last_updated: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Error inserting progress:", insertError)
          }
        }
      }

      setShowCompletionPopup(false) // Hide popup until post-game dialogue is done
    } catch (error: any) {
      console.error("Error saving game progress:", error.message || error)
      // Still show completion popup even if save fails
      setShowCompletionPopup(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Get post-game dialogue from game-content
  const postGameDialogue = (getLevelDialogue("7") as Array<{ speaker: string; text: string; background: string }>).filter(
    (d: { speaker: string; text: string; background: string }) => d.background === "Fixed LessMoore Bridge"
  );

  // Helper to choose background based on current dialogue
  function getCurrentBackground() {
    if (showPostGameDialogue && postGameDialogue.length > 0) {
      return postGameDialogue[postGameIndex].background === "Fixed LessMoore Bridge"
        ? <FixedLessMooreBridgeBackground />
        : <LessmoreBridgeBackground />
    }
    return <LessmoreBridgeBackground />
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Dynamic background based on current dialogue */}
      {getCurrentBackground()}
      {/* Overlay tint for ambience (only for main game, not post-game) */}
      {!showPostGameDialogue && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-700 bg-opacity-20">
        </div>
      )}

      {/* Main game Elder Pebble image (not just post-game) */}
      {!showPostGameDialogue && (
        <>
          <img
            src={"/game characters/Elder Pebble.png"}
            alt="Elder Pebble"
            className="pointer-events-none"
            style={{
              imageRendering: "pixelated",
              filter: "drop-shadow(0 0 12px #000)",
              left: "32%",
              bottom: "32px",
              position: "absolute",
              width: "600px",
              height: "600px",
            
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 border-t-4 border-stone-600 p-6">
            <div className="text-stone-300 font-pixel text-lg mb-2">
              Bridge Stones: {bridgeStones}/5 | Score: {score} | Problem {currentProblem + 1}/5
            </div>
            <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px]">
              Stone {bridgeStones + 1}: Solve this subtraction problem:
              {"\n\n"}
              <span className="text-3xl text-stone-300">{bridgeProblems[currentProblem]?.question} = ?</span>
              {"\n\n"}
            {/* Hint removed as requested */}
            </div>
            <div className="flex justify-between items-center gap-4">
              <Input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your answer (e.g., 1/2)"
                className="text-lg max-w-md bg-gray-800 border-stone-600 text-white"
                disabled={gameEnded}
              />
              <Button
                onClick={checkAnswer}
                disabled={!userAnswer.trim() || gameEnded}
                className="font-pixel bg-stone-600 hover:bg-stone-700 text-white"
              >
                Place Stone
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Emergency exit button */}
      <div className="absolute top-4 right-4">
        <Button
          onClick={() => router.push("/student/game")}
          className="font-pixel bg-gray-600 hover:bg-gray-700 text-white"
        >
          Exit Bridge
        </Button>
      </div>

      {/* Post-game dialogue box (with styled box) */}
      {showPostGameDialogue && postGameDialogue.length > 0 && (
        <div className="absolute inset-0 w-full h-full">
          <FixedLessMooreBridgeBackground />
          {/* Only show Elder Pebble image when he is the speaker */}
          {postGameDialogue[postGameIndex].speaker === "Elder Pebble" && (
            <img
              src={"/game characters/Elder Pebble.png"}
              alt="Elder Pebble"
              className="pointer-events-none"
              style={{
                imageRendering: "pixelated",
                filter: "drop-shadow(0 0 12px #000)",
                left: "10%",
                bottom: "32px",
                position: "absolute",
                width: "600px",
                height: "600px",
                zIndex: 15
              }}
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 border-t-4 border-stone-600 p-6 z-20">
            <div className="text-stone-300 font-pixel text-lg mb-2">{postGameDialogue[postGameIndex].speaker}</div>
            <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px]">
              {postGameDialogue[postGameIndex].text}
            </div>
            <div className="flex justify-end mt-6">
              <Button
                onClick={() => {
                  if (postGameIndex < postGameDialogue.length - 1) {
                    setPostGameIndex(postGameIndex + 1)
                  } else {
                    setShowPostGameDialogue(false)
                    setShowCompletionPopup(true)
                  }
                }}
                className="font-pixel bg-amber-600 hover:bg-amber-700 text-white"
              >
                {postGameIndex < postGameDialogue.length - 1 ? "Next" : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Popup */}
      <LevelCompletionPopup
        isOpen={showCompletionPopup}
        onClose={() => {
          setShowCompletionPopup(false)
          // Return to the map at Lessmore Bridge location
          router.push("/student/map?location=lessmoore-bridge")
        }}
        levelId="7"
        levelName="Bridge Builder Game"
        score={score}
        isStory={false}
      />
    </div>
  )
}
