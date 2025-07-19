"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import DreadpointHollowGameOverPopup from "./DreadpointHollowGameOverPopup"

type BossProblem = {
  type: "conversion" | "addition" | "subtraction" | "arrangement" | "comparison"
  phase: number
  question: string
  answer: string
  choices: string[]
  hint: string
}

const bossProblems: BossProblem[] = [
  // Phase 1: Conversion Clash
  {
    type: "conversion",
    phase: 1,
    question: "Convert 9/4 to a mixed number",
    answer: "2 1/4",
    choices: ["2 1/4", "2 1/2", "2 1/3", "2 1/5"],
    hint: "Divide 9 by 4: 9 ÷ 4 = 2 remainder 1, so it's 2 1/4",
  },
  {
    type: "conversion",
    phase: 1,
    question: "Convert 2 3/5 to an improper fraction",
    answer: "13/5",
    choices: ["5/2", "13/5", "7/5", "11/5"],
    hint: "Multiply 2 × 5 = 10, then add 3: 10 + 3 = 13, so it's 13/5",
  },
  {
    type: "conversion",
    phase: 1,
    question: "Convert 13/5 to a mixed number",
    answer: "2 3/5",
    choices: ["2 3/5", "2 2/5", "3 3/5", "2 5/3"],
    hint: "Divide 13 by 5: 13 ÷ 5 = 2 remainder 3, so it's 2 3/5",
  },

  // Phase 2: Addition Ambush
  {
    type: "addition",
    phase: 2,
    question: "Which pair adds up to 5/6?",
    answer: "2/3 + 1/6",
    choices: ["1/2 + 1/3", "2/3 + 1/6", "1/4 + 1/2", "3/4 + 1/8"],
    hint: "Check: 2/3 + 1/6 = 4/6 + 1/6 = 5/6",
  },
  {
    type: "addition",
    phase: 2,
    question: "What is 2/3 + 1/6?",
    answer: "5/6",
    choices: ["3/9", "5/6", "2/6", "3/6"],
    hint: "Convert to common denominator 6: 2/3 = 4/6, then 4/6 + 1/6 = 5/6",
  },

  // Phase 3: Subtraction Spiral
  {
    type: "subtraction",
    phase: 3,
    question: "What is 7/8 - 3/8?",
    answer: "1/2",
    choices: ["4/8", "1/2", "4/16", "5/8"],
    hint: "Same denominators: 7 - 3 = 4, so 4/8 = 1/2",
  },
  {
    type: "subtraction",
    phase: 3,
    question: "What is 5/6 - 1/2?",
    answer: "1/3",
    choices: ["4/6", "1/3", "2/6", "3/6"],
    hint: "Convert to common denominator 6: 1/2 = 3/6, then 5/6 - 3/6 = 2/6 = 1/3",
  },

  // Phase 4: Fraction Forest Echo
  {
    type: "arrangement",
    phase: 4,
    question: "Arrange from least to greatest: 3/4, 2/3, 5/6, 1/2",
    answer: "1/2, 2/3, 3/4, 5/6",
    choices: ["1/2, 2/3, 3/4, 5/6", "1/2, 3/4, 2/3, 5/6", "5/6, 3/4, 2/3, 1/2", "2/3, 1/2, 3/4, 5/6"],
    hint: "Convert to common denominator 12: 1/2=6/12, 2/3=8/12, 3/4=9/12, 5/6=10/12",
  },

  // Phase 5: Realm of Balance - Comparison Combat
  {
    type: "comparison",
    phase: 5,
    question: "Compare 4/5 and 3/4",
    answer: "4/5 > 3/4",
    choices: ["4/5 > 3/4", "4/5 < 3/4", "4/5 = 3/4", "Cannot compare"],
    hint: "Convert to common denominator 20: 4/5 = 16/20, 3/4 = 15/20. Since 16 > 15, we have 4/5 > 3/4",
  },
  {
    type: "comparison",
    phase: 5,
    question: "Compare 2/3 and 6/9",
    answer: "2/3 = 6/9",
    choices: ["2/3 > 6/9", "2/3 < 6/9", "2/3 = 6/9", "Cannot compare"],
    hint: "Simplify 6/9 = 2/3, so they are equal",
  },
  {
    type: "comparison",
    phase: 5,
    question: "Compare 1/2 and 3/8",
    answer: "1/2 > 3/8",
    choices: ["1/2 > 3/8", "1/2 < 3/8", "1/2 = 3/8", "Cannot compare"],
    hint: "Convert to common denominator 8: 1/2 = 4/8, 3/8 = 3/8. Since 4 > 3, we have 1/2 > 3/8",
  },

  // Final Lightning Round
  {
    type: "conversion",
    phase: 6,
    question: "Convert 11/4 to a mixed number",
    answer: "2 3/4",
    choices: ["2 3/4", "2 4/7", "3 3/4", "2 7/4"],
    hint: "Divide 11 by 4: 11 ÷ 4 = 2 remainder 3, so it's 2 3/4",
  },
  {
    type: "addition",
    phase: 6,
    question: "What is 3/8 + 1/4?",
    answer: "5/8",
    choices: ["4/12", "5/8", "1/2", "3/4"],
    hint: "Convert to common denominator 8: 1/4 = 2/8, then 3/8 + 2/8 = 5/8",
  },
  {
    type: "subtraction",
    phase: 6,
    question: "What is 3/4 - 1/3?",
    answer: "5/12",
    choices: ["2/7", "5/12", "1/4", "2/4"],
    hint: "Convert to common denominator 12: 3/4 = 9/12, 1/3 = 4/12, then 9/12 - 4/12 = 5/12",
  },
  {
    type: "arrangement",
    phase: 6,
    question: "Which is the correct order from least to greatest?",
    answer: "1/4, 1/3, 1/2, 2/3",
    choices: ["1/4, 1/3, 1/2, 2/3", "1/3, 1/4, 1/2, 2/3", "1/4, 1/2, 1/3, 2/3", "1/2, 1/3, 1/4, 2/3"],
    hint: "Convert to common denominator 12: 1/4=3/12, 1/3=4/12, 1/2=6/12, 2/3=8/12",
  },
  {
    type: "comparison",
    phase: 6,
    question: "Compare 5/8 and 7/12",
    answer: "5/8 > 7/12",
    choices: ["5/8 > 7/12", "5/8 < 7/12", "5/8 = 7/12", "Cannot compare"],
    hint: "Convert to common denominator 24: 5/8 = 15/24, 7/12 = 14/24. Since 15 > 14, we have 5/8 > 7/12",
  },
]

// Remove the credits array and credits scroll rendering from this file

export default function DreadpointHollowGame() {
  const router = useRouter()
  const [currentProblem, setCurrentProblem] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(1)
  const [battlePhase, setBattlePhase] = useState<
    "intro" | "battle" | "phase-transition" | "final-blow" | "victory" | "credits"
  >("intro")
  const [phaseMessage, setPhaseMessage] = useState("")
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [creditsFinished, setCreditsFinished] = useState(false)
  const supabase = createClient()
  const [whiskersHealth, setWhiskersHealth] = useState(50)
  // 1. Restore phantomHealth state
  const [phantomHealth, setPhantomHealth] = useState(100)
  // 1. Add mockingDialogues array and mockingDialogue state
  const mockingDialogues = [
    "Your fractions bleed into the void. You were never whole.",
    "Broken pieces, broken mind. The Hollow claims another.",
    "You crumble, Whiskers. The numbers feast on your failure.",
    "Lost in the darkness, your math is your undoing.",
    "The Decimal Phantom devours your hope. Try again, if you dare."
  ];
  const [mockingDialogue, setMockingDialogue] = useState("");
  const [showEerieGameOver, setShowEerieGameOver] = useState(false);
  // Add state for mistake warning
  const [showMistakeWarning, setShowMistakeWarning] = useState(false);
  const [showCriticalWarning, setShowCriticalWarning] = useState(false);
  // Add state for fade-out effect
  const [mistakeFadeOut, setMistakeFadeOut] = useState(false);

  // Victory dialogues
  const victoryDialogues = [
    "How... how could you balance what I made to break?",
    "Fractions aren't just numbers... they're pieces of the whole. And so am I.",
    "The Decimal Phantom shatters into countless fragments, each dissolving into light.",
    "The Fraction Orb begins to reform, pieces flying together from all corners of Numeria.",
    "The orb glows with renewed energy, pulsing with the harmony of balanced fractions.",
    "Light floods Dreadpoint Hollow. The fog lifts. Balance returns to Numeria.",
  ]

  // Intro dialogues following the storyboard
  const introDialogues = [
    {
      speaker: "Whiskers",
      text: "This is it... the end of the path. I've crossed swamps, forests, and shadows. And now, Decimal Phantom—I'm here to fix what you've broken.",
    },
    {
      speaker: "Decimal Phantom",
      text: "Foolish feline... You've scratched at the surface of fractions, but this is the realm of broken logic. Only one with mastery can balance the chaos here.",
    },
    {
      speaker: "Whiskers",
      text: "Then let's see how strong your chaos really is!",
    },
  ]

  const startBattle = () => {
    setGameStarted(true)
    setBattlePhase("battle")
    setCurrentProblem(0)
    setScore(0)
    setWhiskersHealth(50)
    setSelectedAnswer("")
    setCurrentPhase(1)
    setPhaseMessage("Phase 1: Conversion Clash")
    // 2. On startBattle, reset phantomHealth to 100
    setPhantomHealth(100)
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const checkAnswer = () => {
    const problem = bossProblems[currentProblem]
    const isCorrect = selectedAnswer === problem.answer

    if (isCorrect) {
      setScore(score + 20)
      // Calculate health reduction based on phase and total questions
      let healthReduction = 0
      if (currentPhase === 6) {
        // Final phase, more damage per question
        healthReduction = 20
      } else {
        // Earlier phases, less damage
        healthReduction = 10
      }
      setPhantomHealth((prev) => Math.max(0, prev - healthReduction))

      toast({
        title: "Critical Hit!",
        description: `The Decimal Phantom takes damage!`,
        variant: "default",
      })

      // Check if phantom is defeated or if we need to move to next phase
      if (phantomHealth <= 0) {
        setBattlePhase("final-blow")
        return
      }

      // Check if we need to move to the next phase
      const nextProblemIndex = currentProblem + 1
      if (nextProblemIndex >= bossProblems.length || bossProblems[nextProblemIndex].phase !== currentPhase) {
        // End of phase
        if (currentPhase < 6) {
          setCurrentPhase(currentPhase + 1)
          setBattlePhase("phase-transition")
          switch (currentPhase + 1) {
            case 2:
              setPhaseMessage("Phase 2: Addition Ambush")
              break
            case 3:
              setPhaseMessage("Phase 3: Subtraction Spiral")
              break
            case 4:
              setPhaseMessage("Phase 4: Fraction Forest Echo")
              break
            case 5:
              setPhaseMessage("Phase 5: Comparison Combat")
              break
            case 6:
              setPhaseMessage("Final Phase: Lightning Round")
              break
          }
        } else {
          // End of final phase
          setBattlePhase("final-blow")
        }
      } else {
        // Move to next problem in same phase
        setCurrentProblem(nextProblemIndex)
        setSelectedAnswer("")
      }
    } else {
      setWhiskersHealth((prev) => Math.max(0, prev - 10)) // Deduct 10 health for wrong answer
      toast({
        title: "Attack Missed!",
        description: problem.hint,
        variant: "destructive",
      })
      // In checkAnswer, if wrong answer, show mistake warning for 2.5s, then fade out for 0.5s
      setShowMistakeWarning(true);
      setMistakeFadeOut(false);
      setTimeout(() => setMistakeFadeOut(true), 2000);
      setTimeout(() => setShowMistakeWarning(false), 2500);
    }
  }

  const continuePhase = () => {
    setBattlePhase("battle")
    // Find the first problem of the new phase
    const nextProblemIndex = bossProblems.findIndex((problem) => problem.phase === currentPhase)
    setCurrentProblem(nextProblemIndex)
    setSelectedAnswer("")
  }

  const continueDialogue = () => {
    if (battlePhase === "intro") {
      if (dialogueIndex < introDialogues.length - 1) {
        setDialogueIndex(dialogueIndex + 1)
      } else {
        startBattle()
      }
    } else if (battlePhase === "victory") {
      if (dialogueIndex < victoryDialogues.length - 1) {
        setDialogueIndex(dialogueIndex + 1)
      } else {
        router.push("/student/game/level/11");
      }
    }
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
          .eq("waypoint_id", 10) // Dreadpoint Hollow waypoint ID
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
            .eq("waypoint_id", 10)

          if (updateError) {
            console.error("Error updating progress:", updateError)
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase.from("student_progress").insert({
            student_id: user.id,
            waypoint_id: 10,
            completed: true,
            score: score,
            last_updated: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Error inserting progress:", insertError)
          }
        }
      }
    } catch (error) {
      console.error("Error ending game:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 2. When whiskersHealth reaches 0, set a random mocking dialogue and show the popup
  useEffect(() => {
    if (whiskersHealth === 0) {
      const random = Math.floor(Math.random() * mockingDialogues.length);
      setMockingDialogue(mockingDialogues[random]);
      setShowEerieGameOver(true);
    }
  }, [whiskersHealth]);

  // useEffect to show critical health warning when health <= 33%
  useEffect(() => {
    if (whiskersHealth > 0 && whiskersHealth <= 16) {
      setShowCriticalWarning(true);
    } else {
      setShowCriticalWarning(false);
    }
  }, [whiskersHealth]);

  const whiskersHealthPercent = (whiskersHealth / 50) * 100;
  let whiskersBarColor = "bg-green-500";
  if (whiskersHealthPercent <= 33) {
    whiskersBarColor = "bg-red-600";
  } else if (whiskersHealthPercent <= 66) {
    whiskersBarColor = "bg-yellow-400";
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Background */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          battlePhase === "credits" ? "bg-black" : "bg-red-900 bg-opacity-40"
        }`}
      >
        <div className="w-full h-full flex items-center justify-center text-4xl font-pixel text-red-200">
          {battlePhase !== "credits" && "Dreadpoint Hollow"}
        </div>
      </div>

      {/* Credits Scroll */}
      {battlePhase === "credits" && (
        <div className="absolute inset-0 flex flex-col items-center justify-start overflow-hidden">
          <div
            className="text-yellow-300 font-pixel text-center py-8 animate-scroll"
            style={{
              animation: "scroll 60s linear",
              animationFillMode: "forwards",
            }}
          >
            {/* Remove any rendering of the credits array or credits scroll */}
          </div>

          {/* Finish Button - Only appears after credits are done */}
          {creditsFinished && (
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
              <Button
                onClick={() => {
                  endGame()
                  router.push("/student/game")
                }}
                className="font-pixel bg-yellow-600 hover:bg-yellow-700 text-white text-xl px-8 py-4"
              >
                Finish
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Battle UI */}
      {battlePhase === "battle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-40 pb-40">
          <div className="bg-red-900 bg-opacity-80 p-6 rounded-lg mb-8 w-full max-w-2xl">
            {/* Render the boss health bar absolutely centered above the question box, reflecting current phantomHealth */}
            {(battlePhase === "battle" || battlePhase === "phase-transition" || battlePhase === "final-blow" || (battlePhase === "victory" && dialogueIndex >= 2)) && (
              <div className="absolute left-1/2 -translate-x-1/2 z-30 flex flex-col items-center mb-4" style={{bottom: 'calc(50% + 180px)'}}>
                <span className="font-pixel text-red-300 text-lg mb-1">Decimal Phantom</span>
                <div className="w-[90vw] max-w-[1600px] bg-gray-900 border-2 border-red-900 rounded-full h-6 shadow-lg">
                  <div className="bg-red-600 h-6 rounded-full transition-all duration-500" style={{ width: `${phantomHealth}%` }}></div>
                </div>
                <span className="font-pixel text-red-200 text-sm mt-1">{phantomHealth}/100</span>
              </div>
            )}
            <h2 className="text-xl font-pixel text-red-200 mb-2">{phaseMessage}</h2>
            <div className="text-white font-pixel text-2xl mb-6 text-center">
              {bossProblems[currentProblem]?.question}
            </div>

            {/* Score and Health Display */}
            <div className="flex justify-between text-red-300 font-pixel text-sm mb-4">
              {/* <span>
                Phase {currentPhase}/6 • Problem{" "}
                {currentProblem + 1 - bossProblems.findIndex((p) => p.phase === currentPhase)}
              </span> */}
            </div>

            {/* Answer Choices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {bossProblems[currentProblem]?.choices.map((choice, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswerSelect(choice)}
                  className={`text-lg py-4 font-pixel border-2 border-red-600 ${selectedAnswer === choice ? "bg-red-800 text-white no-blue-hover" : "bg-red-100 text-red-900 hover:bg-red-200"}`}
                  style={selectedAnswer === choice ? { boxShadow: "none" } : {}}
                >
                  {choice}
                </Button>
              ))}
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                onClick={checkAnswer}
                disabled={!selectedAnswer}
                className="font-pixel bg-red-600 hover:bg-red-700 text-white"
              >
                Attack!
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Dialogue Box */}
      {battlePhase !== "credits" && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 border-t-4 border-red-800 p-6">
          <div className="text-red-300 font-pixel text-lg mb-2">
            {battlePhase === "intro" && introDialogues[dialogueIndex]?.speaker}
            {(battlePhase === "battle" || battlePhase === "phase-transition" || battlePhase === "final-blow") &&
              "Decimal Phantom"}
            {battlePhase === "victory" && (dialogueIndex < 2 ? "Decimal Phantom" : "Whiskers")}
          </div>
          <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px]">
            {battlePhase === "intro" && introDialogues[dialogueIndex]?.text}
            {battlePhase === "phase-transition" && (
              <>
                {currentPhase === 2 && "Two become one—but which two? Only balance will reveal the answer."}
                {currentPhase === 3 && "Let's take something precious away..."}
                {currentPhase === 4 &&
                  "Trees once stood tall—arranged in perfect order. Now they grow wild. Can you bring order to chaos?"}
                {currentPhase === 5 && "You've seen the pieces—but can you compare the whole?"}
                {currentPhase === 6 && "Let's twist your mind with forms—mixed or improper, you decide."}
              </>
            )}
            {battlePhase === "final-blow" && <>"I've learned. I've failed. I've grown. Now let's end this!"</>}
            {battlePhase === "victory" && <>{victoryDialogues[dialogueIndex]}</>}
          </div>
          <div className="flex justify-between">
            {battlePhase === "intro" && (
              <Button onClick={continueDialogue} className="font-pixel bg-red-600 hover:bg-red-700 text-white">
                Continue
              </Button>
            )}
            {battlePhase === "phase-transition" && (
              <Button onClick={continuePhase} className="font-pixel bg-red-600 hover:bg-red-700 text-white">
                Continue Battle
              </Button>
            )}
            {battlePhase === "final-blow" && (
              <Button
                onClick={() => {
                  setBattlePhase("victory")
                  setDialogueIndex(0)
                }}
                className="font-pixel bg-red-600 hover:bg-red-700 text-white"
              >
                Final Attack!
              </Button>
            )}
            {battlePhase === "victory" && (
              <Button onClick={continueDialogue} className="font-pixel bg-red-600 hover:bg-red-700 text-white">
                Continue
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Emergency exit button - only show during battle phases */}
      {(battlePhase === "intro" || battlePhase === "battle" || battlePhase === "phase-transition") && (
        <div className="absolute top-4 right-4">
          <Button
            onClick={() => router.push("/student/game")}
            className="font-pixel bg-red-600 hover:bg-red-700 text-white"
          >
            Exit Hollow
          </Button>
        </div>
      )}

      {/* Remove all score displays and logic from the UI */}
      {(battlePhase === "battle" || battlePhase === "phase-transition" || battlePhase === "final-blow" || battlePhase === "victory") && (
        <div className="absolute top-4 left-4 z-30 flex flex-col items-start space-y-2">
          {/* In the Whiskers health bar, set the color based on health percentage */}
          <div className="bg-gray-800 rounded-full px-4 py-2 flex items-center mb-2">
            <span className="font-pixel text-blue-200 mr-2">Whiskers</span>
            <div className="w-32 h-4 bg-blue-200 rounded-full overflow-hidden">
              <div className={`h-4 rounded-full transition-all duration-300 ${whiskersBarColor}`} style={{ width: `${whiskersHealthPercent}%` }}></div>
            </div>
            <span className="font-pixel text-blue-200 ml-2">{whiskersHealth}/50</span>
          </div>
          {battlePhase === "battle" && (
            <div className="bg-gray-800 rounded px-3 py-1 mt-1">
              <span className="font-pixel text-blue-100">Phase {currentPhase}/6</span>
              <span className="font-pixel text-blue-100 ml-4">Problem {currentProblem + 1 - bossProblems.findIndex((p) => p.phase === currentPhase)}</span>
            </div>
          )}
        </div>
      )}

      {/* Custom CSS for credits animation */}
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateY(100vh);
          }
          100% {
            transform: translateY(-100%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear;
          animation-fill-mode: forwards;
        }
      `}</style>

      {/* Add custom CSS for more critical warning UI */}
      <style jsx global>{`
        @keyframes critical-pulse {
          0% { box-shadow: 0 0 2px 0px #dc2626cc; }
          50% { box-shadow: 0 0 8px 2px #dc2626cc; }
          100% { box-shadow: 0 0 2px 0px #dc2626cc; }
        }
        .critical-warning {
          animation: critical-pulse 1.2s infinite;
          font-size: 0.95rem;
          font-weight: bold;
          background: #dc2626;
          border: 2px solid #b91c1c;
          color: #fff;
          padding: 0.28rem 0.8rem;
          border-radius: 0.4rem;
          letter-spacing: 0.01em;
          text-shadow: none;
          box-shadow: none;
          backdrop-filter: none;
        }
        @keyframes mistake-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .mistake-fade-out {
          animation: mistake-fade-out 0.5s forwards;
        }
        .mistake-warning {
          font-size: 0.95rem;
          font-weight: bold;
          letter-spacing: 0.01em;
          background: #fde047;
          color: #222;
          border: 2px solid #facc15;
          border-radius: 0.4rem;
          padding: 0.25rem 0.7rem;
          box-shadow: 0 0 2px 0 #facc15;
        }
        .no-blue-hover:hover, .no-blue-hover:focus, .no-blue-hover:active {
          background-color: #991b1b !important;
          color: #fff !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* Render warning messages at the top center of the screen */}
      <div className="absolute left-1/2 -translate-x-1/2 top-8 z-40 flex flex-col items-center">
        {showMistakeWarning && whiskersHealth > 10 && (
          <div className="mistake-warning font-pixel mb-2">
            Mistake! Be careful.
          </div>
        )}
        {showCriticalWarning && (
          <div className="critical-warning font-pixel mb-2">
            Critical Health! One more mistake and it's over!
          </div>
        )}
      </div>

      {/* Render the DreadpointHollowGameOverPopup when showEerieGameOver is true */}
      <DreadpointHollowGameOverPopup
        open={showEerieGameOver}
        dialogue={mockingDialogue}
        onRetry={() => {
          setShowEerieGameOver(false);
          setGameStarted(false);
          setGameEnded(false);
          setCurrentProblem(0);
          setSelectedAnswer("");
          setWhiskersHealth(50);
          setPhantomHealth(100);
          setScore(0);
          setCurrentPhase(1);
          setPhaseMessage("Phase 1: Conversion Clash");
          setDialogueIndex(0);
          setBattlePhase("intro");
        }}
        onQuit={() => {
          setShowEerieGameOver(false);
          router.push("/student/game");
        }}
      />
    </div>
  )
}
