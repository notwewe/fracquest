"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { LevelCompletionPopup } from "../level-completion-popup"

type FractionTree = {
  id: string
  fraction: string
  value: number
}

type Round = {
  trees: FractionTree[]
  goal: "ascending" | "descending"
}

const rounds: Round[] = [
  {
    trees: [
      { id: "1", fraction: "2/3", value: 2 / 3 },
      { id: "2", fraction: "1/2", value: 1 / 2 },
      { id: "3", fraction: "5/6", value: 5 / 6 },
      { id: "4", fraction: "3/8", value: 3 / 8 },
    ],
    goal: "ascending",
  },
  {
    trees: [
      { id: "1", fraction: "4/5", value: 4 / 5 },
      { id: "2", fraction: "7/10", value: 7 / 10 },
      { id: "3", fraction: "3/4", value: 3 / 4 },
      { id: "4", fraction: "5/8", value: 5 / 8 },
      { id: "5", fraction: "1/2", value: 1 / 2 },
    ],
    goal: "descending",
  },
  {
    trees: [
      { id: "1", fraction: "5/12", value: 5 / 12 },
      { id: "2", fraction: "1/3", value: 1 / 3 },
      { id: "3", fraction: "3/8", value: 3 / 8 },
      { id: "4", fraction: "1/4", value: 1 / 4 },
      { id: "5", fraction: "1/2", value: 1 / 2 },
    ],
    goal: "ascending",
  },
]

function SortableTree({ tree }: { tree: FractionTree }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tree.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
    >
      <div className="w-40 h-36 bg-green-00 rounded-lg flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: "url('/auth/tree1.png')", 
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      >
        <div className="absolute top-0 w-24 h-12 bg-green-0 rounded-full -mt-4"></div>
        <div className="text-white font-bold text-xl">{tree.fraction}</div>
      </div>
    </div>
  )
}

export default function FractionForestGame() {
  const router = useRouter()
  const [currentRound, setCurrentRound] = useState(0)
  const [trees, setTrees] = useState<FractionTree[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [score, setScore] = useState(0)
  const [dialoguePhase, setDialoguePhase] = useState<
    "intro" | "tutorial" | "game" | "success" | "failure" | "complete"
  >("intro")
  const [isLoading, setIsLoading] = useState(false)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    if (rounds[currentRound]) {
      setTrees([...rounds[currentRound].trees])
    }
  }, [currentRound])

  const startGame = () => {
    setGameStarted(true)
    setDialoguePhase("tutorial")
  }

  const startRound = () => {
    setDialoguePhase("game")
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setTrees((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const checkOrder = () => {
    const round = rounds[currentRound]
    const sortedTrees = [...trees].sort((a, b) => (round.goal === "ascending" ? a.value - b.value : b.value - a.value))

    const isCorrect = trees.every((tree, index) => tree.id === sortedTrees[index].id)

    if (isCorrect) {
      setScore(score + 25)
      setDialoguePhase("success")

      toast({
        title: "Correct!",
        description: "The trees are in perfect order!",
        variant: "default",
      })
    } else {
      setDialoguePhase("failure")

      toast({
        title: "Not quite right",
        description: "The trees need to be rearranged. Try again!",
        variant: "destructive",
      })
    }
  }

  const nextRound = () => {
    if (currentRound < rounds.length - 1) {
      setCurrentRound(currentRound + 1)
      setDialoguePhase("game")
    } else {
      setDialoguePhase("complete")
      endGame()
    }
  }

  const tryAgain = () => {
    setTrees([...rounds[currentRound].trees])
    setDialoguePhase("game")
  }

  const endGame = async () => {
    setGameEnded(true)
    setIsLoading(true)

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
          .eq("waypoint_id", 8) // Fraction Forest waypoint ID
          .maybeSingle()

        if (existingProgress) {
          // Update existing record only if new score is higher
          const newScore = Math.max(existingProgress.score || 0, score)
          const { error: updateError } = await supabase
            .from("student_progress")
            .update({
              completed: true,
              score: newScore,
              last_updated: new Date().toISOString(),
            })
            .eq("student_id", user.id)
            .eq("waypoint_id", 8)

          if (updateError) {
            console.error("Error updating progress:", updateError)
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase.from("student_progress").insert({
            student_id: user.id,
            waypoint_id: 8,
            completed: true,
            score: score,
            last_updated: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Error inserting progress:", insertError)
          }
        }
      }

      setShowCompletionPopup(true)
    } catch (error) {
      console.error("Error ending game:", error)
      setShowCompletionPopup(true) // Show popup even if save fails
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden"
      style={{
        backgroundImage: "url('/game backgrounds/Fraction Forest Entrance.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 flex items-center justify-center bg-green-900 bg-opacity-40">
        <div className="w-full h-full flex items-center justify-center text-4xl font-pixel text-green-200">
        </div>
      </div>

      {/* Game Area */}
      {dialoguePhase === "game" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 pb-40">
          <div className="bg-green-800 bg-opacity-80 p-8 rounded-lg mb-8 w-full max-w-5xl mx-auto">
            <h2 className="text-2xl font-pixel text-green-200 mb-4">
              {rounds[currentRound].goal === "ascending"
                ? "Drag the trees to arrange from smallest to largest"
                : "Drag the trees to arrange from largest to smallest"}
            </h2>
            <div className="text-green-300 text-lg mb-6">
              Round {currentRound + 1} of 3 • Score: {score}
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={trees.map((tree) => tree.id)}>
                <div className="flex justify-center space-x-10 mb-8 w-full max-w-5xl mx-auto">
                  {trees.map((tree) => (
                    <SortableTree key={tree.id} tree={tree} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="flex justify-center mt-6">
              <Button
                onClick={checkOrder}
                className="bg-green-600 hover:bg-green-700 text-white font-pixel text-lg py-6 px-8"
              >
                Check Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogue Box */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 border-t-4 border-green-800 p-6">
        <div className="flex items-end">
          {(dialoguePhase === "intro" ||
            dialoguePhase === "tutorial" ||
            dialoguePhase === "success" ||
            dialoguePhase === "failure" ||
            dialoguePhase === "complete") && (
            <img
              src="/game characters/Elder Barkroot.png"
              alt="Elder Barkroot"
              style={{
                imageRendering: "pixelated",
                filter: "drop-shadow(0 0 12px #000)",
                transform: "scaleX(-1)",
                position: "relative",
                left: "43%", 
                bottom: "300px", 
                width: "220px", 
                height: "220px", 
              }}
            />
          )}
          <div className="flex-1">
            <div className="text-green-300 font-pixel text-lg mb-2">Elder Barkroot</div>
            <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px]">
              {dialoguePhase === "intro" && (
                <>
                  "The forest breathes in fractions. When their order is disturbed, so is the grove. You must line up the Trees of Fraction from the smallest to the largest, and balance shall return."
                  {"\n\n"}
                  You have 3 lives. 3 mistakes and the game ends.
                  {"\n"}Score 60 or more to pass. Good luck!
                </>
              )}
              {dialoguePhase === "tutorial" && (
                <>
                  "Each tree bears a fraction. Drag them into the correct order - from smallest to largest or largest to smallest as I instruct. When the trees are in harmony, the forest will flourish again."
                </>
              )}
              {dialoguePhase === "success" && (
                <>
                  "Beautiful! The grove stands tall and true. The balance is restored. The trees glow with renewed energy!"
                </>
              )}
              {dialoguePhase === "failure" && (
                <>
                  "Hmm... the roots grumble. Their growth needs better order. Remember, to compare fractions, find a common
                  denominator first."
                </>
              )}
              {dialoguePhase === "complete" && (
                <>
                  "You've done well, brave traveler. The roots are aligned, and the forest is healing. Beyond these woods
                  lies the Realm of Balance, where harmony isn't just found in order... but in comparison."
                </>
              )}
            </div>
            <div className="flex justify-between">
              {dialoguePhase === "intro" && (
                <Button onClick={startGame} className="font-pixel bg-green-600 hover:bg-green-700 text-white">
                  Continue
                </Button>
              )}
              {dialoguePhase === "tutorial" && (
                <Button onClick={startRound} className="font-pixel bg-green-600 hover:bg-green-700 text-white">
                  Start Challenge
                </Button>
              )}
              {dialoguePhase === "success" && (
                <Button onClick={nextRound} className="font-pixel bg-green-600 hover:bg-green-700 text-white">
                  Continue
                </Button>
              )}
              {dialoguePhase === "failure" && (
                <Button onClick={tryAgain} className="font-pixel bg-green-600 hover:bg-green-700 text-white">
                  Try Again
                </Button>
              )}
              {dialoguePhase === "complete" && !showCompletionPopup && (
                <Button
                  onClick={() => setShowCompletionPopup(true)}
                  className="font-pixel bg-green-600 hover:bg-green-700 text-white"
                >
                  Complete Forest
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency exit button */}
      <div className="absolute top-4 right-4">
        <Button
          onClick={() => router.push("/student/game")}
          className="font-pixel bg-gray-600 hover:bg-gray-700 text-white"
        >
          Exit Forest
        </Button>
      </div>

      {/* Completion Popup */}
      <LevelCompletionPopup
        isOpen={showCompletionPopup}
        onClose={() => {
          setShowCompletionPopup(false)
          router.push("/student/game")
        }}
        levelId="8"
        levelName="Fraction Forest"
        score={score}
        isStory={false}
      />
    </div>
  )
}
