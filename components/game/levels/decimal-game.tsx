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

      const options = [selectedDecimal.\
