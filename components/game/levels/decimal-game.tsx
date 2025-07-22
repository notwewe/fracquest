"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Props = {
  waypointId: number
  userId: string
  levelName?: string
}

interface Question {
  question: string
  options: string[]
  answer: string
  type: "fraction-to-decimal" | "decimal-to-fraction"
}

export function DecimalGame({ waypointId, userId, levelName = "Decimal Conversion Challenge" }: Props) {
  const [gameState, setGameState] = useState<"tutorial" | "playing" | "complete">("tutorial")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [score, setScore] = useState(20) // Start with max score
  const [mistakes, setMistakes] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [completedQuestions, setCompletedQuestions] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)
  const [totalQuestions] = useState(5) // 5 questions per game
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Generate a decimal conversion question
  const generateQuestion = (): Question => {
    // Decide if we'll convert from fraction to decimal or decimal to fraction
    const fractionToDecimal = Math.random() > 0.5

    if (fractionToDecimal) {
      // Fraction to decimal
      const commonFractions = [
        { fraction: "1/2", decimal: "0.5" },
        { fraction: "1/4", decimal: "0.25" },
        { fraction: "3/4", decimal: "0.75" },
        { fraction: "1/5", decimal: "0.2" },
        { fraction: "2/5", decimal: "0.4" },
        { fraction: "3/5", decimal: "0.6" },
        { fraction: "4/5", decimal: "0.8" },
        { fraction: "1/8", decimal: "0.125" },
        { fraction: "3/8", decimal: "0.375" },
        { fraction: "5/8", decimal: "0.625" },
        { fraction: "7/8", decimal: "0.875" },
        { fraction: "1/3", decimal: "0.333..." },
        { fraction: "2/3", decimal: "0.666..." },
      ]

      const selectedFraction = commonFractions[Math.floor(Math.random() * commonFractions.length)]

      // Generate options
      const wrongOptions = commonFractions
        .filter((f) => f.decimal !== selectedFraction.decimal)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .map((f) => f.decimal)

      const options = [selectedFraction.decimal, ...wrongOptions].sort(() => Math.random() - 0.5)

      return {
        question: `Convert ${selectedFraction.fraction} to a decimal:`,
        options,
        answer: selectedFraction.decimal,
        type: "fraction-to-decimal",
      }
    } else {
      // Decimal to fraction
      const commonDecimals = [
        { decimal: "0.5", fraction: "1/2" },
        { decimal: "0.25", fraction: "1/4" },
        { decimal: "0.75", fraction: "3/4" },
        { decimal: "0.2", fraction: "1/5" },
        { decimal: "0.4", fraction: "2/5" },
        { decimal: "0.6", fraction: "3/5" },
        { decimal: "0.8", fraction: "4/5" },
        { decimal: "0.125", fraction: "1/8" },
        { decimal: "0.375", fraction: "3/8" },
        { decimal: "0.625", fraction: "5/8" },
        { decimal: "0.875", fraction: "7/8" },
        { decimal: "0.333...", fraction: "1/3" },
        { decimal: "0.666...", fraction: "2/3" },
      ]

      const selectedDecimal = commonDecimals[Math.floor(Math.random() * commonDecimals.length)]

      // Generate options
      const wrongOptions = commonDecimals
        .filter((d) => d.fraction !== selectedDecimal.fraction)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .map((d) => d.fraction)

      const options = [selectedDecimal.fraction, ...wrongOptions].sort(() => Math.random() - 0.5)

      return {
        question: `Convert ${selectedDecimal.decimal} to a fraction:`,
        options,
        answer: selectedDecimal.fraction,
        type: "decimal-to-fraction",
      }
    }
  }

  const handleAnswer = (selectedOption: string) => {
    setAttempts((prev) => prev + 1);
    if (selectedOption === currentQuestion?.answer) {
      setScore((prev) => prev + 10); // Correct answer
      setFeedback("Correct!");
    } else {
      setMistakes((prev) => prev + 1);
      setFeedback("Incorrect. Try again.");
    }
    setCurrentQuestion(null); // Clear current question
    setCompletedQuestions((prev) => prev + 1);

    if (completedQuestions < totalQuestions) {
      setCurrentQuestion(generateQuestion());
      setCurrentQuestionNumber((prev) => prev + 1);
    } else {
      setGameState("complete");
      setShowCompletionPopup(true);
    }
  };

  const startGame = () => {
    setGameState("playing");
    setScore(20); // Reset score
    setMistakes(0);
    setAttempts(0);
    setCurrentQuestion(generateQuestion());
    setCurrentQuestionNumber(1);
    setCompletedQuestions(0);
    setFeedback(null);
  };

  const endGame = async () => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not logged in");
      }

      await supabase.from("student_progress").upsert({
        student_id: user.id,
        waypoint_id: waypointId,
        completed: true,
        score: score,
        mistakes,
        attempts,
        last_updated: new Date().toISOString(),
      });
      router.push(`/waypoints/${waypointId}`);
    } catch (error) {
      console.error("Error updating student progress:", error);
      setFeedback("Failed to save progress. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (gameState === "tutorial") {
    return (
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-4">{levelName}</h1>
        <p className="text-lg mb-6">
          In this game, you'll practice converting between fractions and decimals.
          You'll be given a question and four options. Select the correct answer
          to earn points.
        </p>
        <button
          onClick={startGame}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
        >
          Start Game
        </button>
      </div>
    );
  }

  if (gameState === "playing") {
    if (!currentQuestion) {
      return <div>Error: No question generated.</div>;
    }

    return (
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold mb-4">Question {currentQuestionNumber}</h2>
        <p className="text-xl mb-6">{currentQuestion.question}</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg"
            >
              {option}
            </button>
          ))}
        </div>
        <p className="text-lg">Score: {score}</p>
        <p className="text-lg">Mistakes: {mistakes}</p>
        <p className="text-lg">Attempts: {attempts}</p>
        {feedback && <p className="text-red-500 mt-4">{feedback}</p>}
      </div>
    );
  }

  if (gameState === "complete") {
    return (
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
        <p className="text-xl mb-6">
          You completed the game with a score of {score}.
        </p>
        <p className="text-lg">Total Mistakes: {mistakes}</p>
        <p className="text-lg">Total Attempts: {attempts}</p>
        <button
          onClick={endGame}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
        >
          Finish Game
        </button>
      </div>
    );
  }

  return null;
}
