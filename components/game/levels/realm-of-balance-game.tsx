"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { LevelCompletionPopup } from "../level-completion-popup"

type ComparisonQuestion = {
  leftFraction: string
  rightFraction: string
  correctAnswer: ">" | "<" | "="
  leftValue: number
  rightValue: number
}

export default function RealmOfBalanceGame() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [questions, setQuestions] = useState<ComparisonQuestion[]>([])
  const [dialoguePhase, setDialoguePhase] = useState<"intro" | "game" | "feedback" | "complete">("intro")
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCompletionPopup, setShowLevelCompletionPopup] = useState(false)
  const supabase = createClient()
  const [mistakes, setMistakes] = useState(0);
  const [attempts, setAttempts] = useState(0);
  // Remove all mistakes/attempts state and logic
  // In answer handler, if user makes 3 mistakes and score < passing, setGameOver(true) and require retry
  // If user passes, allow completion regardless of mistakes
  // Only write score and completed to student_progress in endGame
  const [gameOver, setGameOver] = useState(false)
  const [passed, setPassed] = useState(false)
  const [gameOverReason, setGameOverReason] = useState<'mistakes' | null>(null);
  const endGameCalled = useRef(false);

  // Generate comparison questions
  useEffect(() => {
    if (!gameStarted) {
      const generatedQuestions = generateQuestions(5)
      setQuestions(generatedQuestions)
    }
  }, [gameStarted])

  const generateQuestions = (count: number): ComparisonQuestion[] => {
    const questions: ComparisonQuestion[] = []

    for (let i = 0; i < count; i++) {
      // Decide what type of question to generate
      const questionType = Math.floor(Math.random() * 3) // 0: >, 1: <, 2: =

      if (questionType === 2) {
        // Equal fractions
        const denominator1 = Math.floor(Math.random() * 8) + 2 // 2-9
        const numerator1 = Math.floor(Math.random() * (denominator1 - 1)) + 1 // 1 to denominator-1

        // Create an equivalent fraction
        const multiplier = Math.floor(Math.random() * 3) + 2 // 2-4
        const denominator2 = denominator1 * multiplier
        const numerator2 = numerator1 * multiplier

        questions.push({
          leftFraction: `${numerator1}/${denominator1}`,
          rightFraction: `${numerator2}/${denominator2}`,
          correctAnswer: "=",
          leftValue: numerator1 / denominator1,
          rightValue: numerator2 / denominator2,
        })
      } else {
        // Generate two different fractions
        let leftNumerator, leftDenominator, rightNumerator, rightDenominator
        let leftValue, rightValue

        do {
          leftDenominator = Math.floor(Math.random() * 8) + 2 // 2-9
          leftNumerator = Math.floor(Math.random() * (leftDenominator - 1)) + 1 // 1 to denominator-1

          rightDenominator = Math.floor(Math.random() * 8) + 2 // 2-9
          rightNumerator = Math.floor(Math.random() * (rightDenominator - 1)) + 1 // 1 to denominator-1

          leftValue = leftNumerator / leftDenominator
          rightValue = rightNumerator / rightDenominator
        } while (Math.abs(leftValue - rightValue) < 0.05 || leftValue === rightValue) // Ensure they're not too close or equal

        const correctAnswer = leftValue > rightValue ? ">" : "<"

        questions.push({
          leftFraction: `${leftNumerator}/${leftDenominator}`,
          rightFraction: `${rightNumerator}/${rightDenominator}`,
          correctAnswer,
          leftValue,
          rightValue,
        })
      }
    }

    return questions
  }

  const startGame = () => {
    setGameStarted(true)
    setDialoguePhase("game")
    setScore(0)
    setCurrentQuestion(0)
    setFeedback(null)
    setGameOver(false)
    setPassed(false)
    setMistakes(0)
    setGameOverReason(null)
    endGameCalled.current = false;
  }

  const handleAnswer = (answer: "<" | ">" | "=") => {
    if (currentQuestion >= questions.length) return;
    const isCorrect = answer === questions[currentQuestion].correctAnswer;
    if (!isCorrect) {
      setMistakes((prev) => prev + 1);
      setFeedback('incorrect');
      setDialoguePhase('feedback');
      if (mistakes + 1 >= 3) {
        if (score >= 60) {
          setPassed(true);
          setGameEnded(true);
          setShowLevelCompletionPopup(true);
          setDialoguePhase('complete');
        } else {
          setGameOver(true);
          setShowLevelCompletionPopup(true);
          setDialoguePhase('complete');
          setGameOverReason('mistakes');
          handleFailedAttempt();
        }
        if (!endGameCalled.current) {
          endGameCalled.current = true;
          endGame(score);
        }
        return;
      }
      // After feedback, auto-return to question after 3 seconds
      setTimeout(() => {
        setFeedback(null);
        setDialoguePhase('game');
      }, 3000);
      return;
    } else {
      const newScore = Math.min(score + 20, 100);
      setScore(newScore);
      setFeedback('correct');
      setDialoguePhase('feedback');
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setDialoguePhase('game');
        } else {
          setPassed(newScore >= 60);
          setGameEnded(true);
          setShowLevelCompletionPopup(true);
          setDialoguePhase('complete');
          if (!endGameCalled.current) {
            endGameCalled.current = true;
            endGame(newScore);
          }
        }
      }, 3000);
    }
  };

  const handleFailedAttempt = async () => {
    // Increment attempts in student_progress
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: existingProgress } = await supabase
        .from("student_progress")
        .select("*")
        .eq("student_id", user.id)
        .eq("waypoint_id", 9)
        .maybeSingle();
      if (existingProgress) {
        await supabase
          .from("student_progress")
          .update({ attempts: (existingProgress.attempts || 0) + 1 })
          .eq("student_id", user.id)
          .eq("waypoint_id", 9);
      } else {
        await supabase.from("student_progress").insert({
          student_id: user.id,
          waypoint_id: 9,
          attempts: 1,
        });
      }
    }
  };

  const endGame = async (finalScore: number) => {
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
          .eq("waypoint_id", 9) // Realm of Balance waypoint ID
          .maybeSingle()

        if (existingProgress) {
          // Update existing record only if new score is higher
          const newScore = Math.max(existingProgress.score || 0, finalScore)
          const { error: updateError } = await supabase
            .from("student_progress")
            .update({
              completed: true,
              score: newScore,
              last_updated: new Date().toISOString(),
            })
            .eq("student_id", user.id)
            .eq("waypoint_id", 9)

          if (updateError) {
            console.error("Error updating progress:", updateError)
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase.from("student_progress").insert({
            student_id: user.id,
            waypoint_id: 9,
            completed: true,
            score: finalScore,
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

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden"
      style={{
          backgroundImage: "url('/game backgrounds/Realm of Balance.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
    >
      {/* Background */}
      <div className="absolute inset-0 flex items-center justify-center bg-blue-900 bg-opacity-40">
        <div className="w-full h-full flex items-center justify-center text-4xl font-pixel text-blue-200">
          
        </div>
      </div>

      {/* Game Area */}
      {dialoguePhase === "game" && questions.length > 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 pb-40">
          <div className="bg-blue-800 bg-opacity-90 p-8 rounded-lg mb-8 w-full max-w-6xl mx-auto">
            <h2 className="text-2xl font-pixel text-blue-200 mb-2">The Scale of Judgment</h2>
            <div className="text-blue-300 text-lg mb-4">
              Question {currentQuestion + 1} of 5 • Score: {score}/100
            </div>

            {gameStarted && dialoguePhase === "game" && !gameEnded && !gameOver && (
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-gray-800 rounded-full px-4 py-2 flex items-center">
                  <span className="font-pixel text-blue-200 mr-2">Mistakes</span>
                  <div className="w-24 h-4 bg-red-200 rounded-full overflow-hidden">
                    <div className="h-4 bg-red-600 rounded-full transition-all duration-300" style={{ width: `${(mistakes/3)*100}%` }}></div>
                  </div>
                  <span className="font-pixel text-blue-200 ml-2">{mistakes}/3</span>
                </div>
              </div>
            )}

            <div className="flex justify-center items-center space-x-8 mb-6">
              <div
                className="p-8 rounded-lg text-center w-56 relative"
                style={{
                  backgroundImage: "url('/game assets/scale.png')",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "left top",
                }}
              >
                <div className="text-white font-pixel text-3xl relative z-10">{questions[currentQuestion].leftFraction}</div>
              </div>

              <div className="text-white font-pixel text-6xl">?</div>

              <div
                className="p-8 rounded-lg text-center w-56 relative"
                style={{
                  backgroundImage: "url('/game assets/scale.png')",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right top",
                }}
              >
                <div className="text-white font-pixel text-3xl relative z-10">{questions[currentQuestion].rightFraction}</div>
              </div>
            </div>
            <div className="flex justify-center space-x-4 mt-6">
              <Button
                onClick={() => handleAnswer(">")}
                className="font-pixel bg-blue-600 hover:bg-blue-700 text-white text-4xl px-8 py-6"
              >
                &gt;
              </Button>
              <Button
                onClick={() => handleAnswer("=")}
                className="font-pixel bg-blue-600 hover:bg-blue-700 text-white text-4xl px-8 py-6"
              >
                =
              </Button>
              <Button
                onClick={() => handleAnswer("<")}
                className="font-pixel bg-blue-600 hover:bg-blue-700 text-white text-4xl px-8 py-6"
              >
                &lt;
              </Button>
            </div>          
          </div>
        </div>
      )}

      {/* Dialogue Box */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 border-t-4 border-blue-800 p-6">
        {/* Guardian of Equilibrium image as background, behind the dialogue */}
        {(dialoguePhase === "intro" ||
          dialoguePhase === "feedback" ||
          dialoguePhase === "complete") && (
          <img
            src="/game characters/guardian of equilibrium.png"
            alt="Guardian of Equilibrium"
            style={{
              imageRendering: "pixelated",
              filter: "drop-shadow(0 0 32px #000)",
              position: "absolute",
              left: "50%",
              bottom: "100%", 
              transform: "translate(-50%, 0%)",
              width: "480px",
              height: "480px",
              zIndex: 0,
              opacity: 0.9,
              pointerEvents: "none",
            }}
          />
        )}
        <div className="flex items-end relative z-10">
          <div className="flex-1">
            <div className="text-blue-300 font-pixel text-lg mb-2">Guardian of Equilibrium</div>
            <div className="text-white font-pixel text-xl mb-4 whitespace-pre-wrap min-h-[100px]">
              {dialoguePhase === "intro" && (
                <>
                  "To pass through the Realm of Balance, you must decide... Which fraction weighs more? Which weighs less? Or do they match? Choose the correct symbol: &gt;, &lt;, or =."
                  {"\n\n"}
                  You have 3 lives. 3 mistakes and the game ends.
                  {"\n"}Score 60 or more to pass. Good luck!
                </>
              )}
              {dialoguePhase === "feedback" && feedback === "correct" && (
                <>"Well judged! Your understanding of fractions brings balance to the scales."</>
              )}
              {dialoguePhase === "feedback" && feedback === "incorrect" && (
                <>
                  "The scales tilt with uncertainty. Remember to find a common denominator to compare fractions accurately."
                </>
              )}
              {dialoguePhase === "complete" && (
                <>
                  {passed ? (
                    "You have judged with wisdom. The scales are balanced. The path to Dreadpoint Hollow is now open. Proceed, Whiskers, and face your final challenge."
                  ) : (
                    ""
                  )}
                </>
              )}
            </div>
            <div className="flex justify-between">
              {dialoguePhase === "intro" && (
                <Button onClick={startGame} className="font-pixel bg-blue-600 hover:bg-blue-700 text-white">
                  Begin Trial
                </Button>
              )}
            </div>
            {/* Remove the Try Again button from the feedback dialogue for wrong answers. */}
          </div>
        </div>
      </div>

      {/* Emergency exit button */}
      <div className="absolute top-4 right-4">
        <Button
          onClick={() => {
            const location = searchParams.get('location') || 'realm-of-balance';
            router.push(`/student/game?location=${location}`);
          }}
          className="font-pixel bg-red-600 hover:bg-red-700 text-white"
        >
          Exit Realm
        </Button>
      </div>

      {/* Completion Popup */}
      <LevelCompletionPopup
        isOpen={showCompletionPopup}
        onClose={() => {
          setShowLevelCompletionPopup(false)
          const location = searchParams.get('location') || 'realm-of-balance';
          router.push(`/student/game?location=${location}`);
        }}
        onRetry={() => {
          setShowLevelCompletionPopup(false)
          setGameStarted(false)
          setGameEnded(false)
          setGameOver(false)
          setPassed(false)
          setCurrentQuestion(0)
          setScore(0)
          setDialoguePhase("intro")
          setMistakes(0)
          setGameOverReason(null)
        }}
        levelId="9"
        levelName="Realm of Balance"
        score={score}
        isGameOver={gameOver}
        isStory={false}
        passed={passed}
        maxScore={100}
        gameOverReason={gameOverReason}
      />
    </div>
  )
}
