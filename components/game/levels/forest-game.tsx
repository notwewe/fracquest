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
  fractions: string[]
  correctOrder: string[]
  options: string[][]
}

export function ForestGame({ waypointId, userId, levelName = "Fraction Forest Challenge" }: Props) {
  const [gameState, setGameState] = useState<"tutorial" | "playing" | "complete">("tutorial")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [score, setScore] = useState(20) // Start with max score
  const [mistakes, setMistakes] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)
  const [totalQuestions] = useState(5) // 5 questions per game
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const supabase = createClient()
  const router = useRouter()

  // Generate a fraction ordering question
  const generateQuestion = (): Question => {
    // Predefined sets of fractions to order
    const fractionSets = [
      {
        fractions: ["2/3", "1/2", "5/6", "3/8"],
        correctOrder: ["3/8", "1/2", "2/3", "5/6"],
      },
      {
        fractions: ["4/5", "7/10", "3/4", "2/3"],
        correctOrder: ["2/3", "3/4", "7/10", "4/5"],
      },
      {
        fractions: ["5/12", "3/8", "7/12", "1/3"],
        correctOrder: ["1/3", "5/12", "3/8", "7/12"],
      },
      {
        fractions: ["3/4", "5/8", "7/8", "1/2"],
        correctOrder: ["1/2", "5/8", "3/4", "7/8"],
      },
      {
        fractions: ["2/5", "3/10", "1/2", "3/5"],
        correctOrder: ["3/10", "2/5", "1/2", "3/5"],
      },
    ]

    // Select a random set
    const randomSet = fractionSets[Math.floor(Math.random() * fractionSets.length)]

    // Generate options (including the correct order and some wrong orders)
    const correctOption = [...randomSet.correctOrder]
    
    // Generate wrong options by shuffling the correct order
    const wrongOption1 = [...randomSet.correctOrder].sort(() => Math.random() - 0.5)
    const wrongOption2 = [...randomSet.correctOrder].sort(() => Math.random() - 0.5)
    
    // Ensure wrong options are actually wrong
    while (arraysEqual(wrongOption1, randomSet.correctOrder)) {
      wrongOption1.sort(() => Math.random() - 0.5)
    }
    
    while (arraysEqual(wrongOption2, randomSet.correctOrder) || arraysEqual(wrongOption2, wrongOption1)) {
      wrongOption2.sort(() => Math.random() - 0.5)
    }

    const options = [correctOption, wrongOption1, wrongOption2].sort(() => Math.random() - 0.5)

    return {
      fractions: randomSet.fractions,
      correctOrder: randomSet.correctOrder,
      options,
    }
  }

  // Helper function to compare arrays
  function arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false
    for (const i = 0; i\
