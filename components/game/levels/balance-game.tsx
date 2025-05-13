"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LevelCompletionPopup } from "../level-completion-popup"

type FractionPair = {
  left: string
  right: string
  answer: ">" | "<" | "="
}

export function BalanceGame() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(20)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [gameComplete, setGameComplete] = useState(false)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [feedback, setFeedback] = useState("")

  const questions: FractionPair[] = [
    { left: "3/4", right: "2/3", answer: ">" },
    { left: "5/10", right: "1/2", answer: "=" },
    { left: "4/9", right: "5/9", answer: "<" },
    { left: "2/3", right: "7/12", answer: ">" },
    { left: "3/8", right: "5/12", answer: "<" },
  ]

  const guardianFeedback = {
    correct: [
      "You tip the scales with truth.",
      "Balance comes from clarity. Well done.",
      "The scales acknowledge your wisdom.",
      "You've judged with precision.",
      "The balance is maintained. Proceed.",
    ],
    incorrect: [
      "Balance comes from clarity. Try again.",
      "The scales reject your judgment.",
      "Equilibrium requires truth. Reconsider.",
      "Your answer disturbs the balance.",
      "The scales tilt against you. Think again.",
    ],
  }

  useEffect(() => {
    if (currentQuestion >= questions.length) {
      setGameComplete(true)
      setShowCompletionPopup(true)
    }
  }, [currentQuestion])

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    const correct = answer === questions[currentQuestion].answer
    setIsCorrect(correct)

    if (correct) {
      setFeedback(guardianFeedback.correct[Math.floor(Math.random() * guardianFeedback.correct.length)])
    } else {
      setFeedback(guardianFeedback.incorrect[Math.floor(Math.random() * guardianFeedback.incorrect.length)])
      setScore(Math.max(0, score - 2)) // Deduct 2 points for wrong answer
    }

    setTimeout(() => {
      setSelectedAnswer(null)
      setIsCorrect(null)
      setFeedback("")
      if (correct) {
        setCurrentQuestion(currentQuestion + 1)
      }
    }, 1500)
  }

  const getSymbolDisplay = (symbol: string) => {
    switch (symbol) {
      case ">":
        return "Greater Than (>)"
      case "<":
        return "Less Than (<)"
      case "=":
        return "Equal To (=)"
      default:
        return symbol
    }
  }

  const renderFraction = (fraction: string) => {
    const parts = fraction.split("/")
    if (parts.length === 2) {
      return (
        <div className="text-center">
          <div className="text-2xl font-bold">{parts[0]}</div>
          <div className="border-t-2 border-black w-full my-1"></div>
          <div className="text-2xl font-bold">{parts[1]}</div>
        </div>
      )
    }
    return <div className="text-2xl font-bold">{fraction}</div>
  }

  if (gameComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        {showCompletionPopup && (
          <LevelCompletionPopup
            levelName="Realm of Balance"
            score={score}
            onClose={() => setShowCompletionPopup(false)}
          />
        )}
        <div className="text-center mt-8">
          <h2 className="text-2xl font-bold mb-4">Guardian of Equilibrium:</h2>
          <p className="text-lg mb-6">"You have judged with wisdom. The scales are balanced. Proceed, Whiskers."</p>
          <p className="italic text-gray-600">
            The floating scale splits in two, revealing a crystal bridge leading to the final realm...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">The Scale of Judgment</h2>
        <p className="text-lg mt-2">Compare the fractions and choose the correct symbol</p>
        <p className="text-sm mt-1">
          Question {currentQuestion + 1} of {questions.length}
        </p>
        <p className="text-sm font-semibold">Score: {score}/20</p>
      </div>

      <Card className="p-6 w-full max-w-2xl bg-gradient-to-b from-amber-50 to-amber-100 shadow-lg border-amber-200">
        <div className="flex justify-center items-center space-x-8 mb-8">
          <div className="w-24 h-32 bg-amber-200 rounded-lg flex items-center justify-center p-2 shadow-md">
            {currentQuestion < questions.length && renderFraction(questions[currentQuestion].left)}
          </div>

          <div className="text-3xl font-bold text-gray-500">?</div>

          <div className="w-24 h-32 bg-amber-200 rounded-lg flex items-center justify-center p-2 shadow-md">
            {currentQuestion < questions.length && renderFraction(questions[currentQuestion].right)}
          </div>
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          {["<", "=", ">"].map((symbol) => (
            <Button
              key={symbol}
              onClick={() => handleAnswer(symbol)}
              disabled={selectedAnswer !== null}
              className={`w-24 h-16 text-2xl font-bold ${
                selectedAnswer === symbol
                  ? isCorrect
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {symbol}
            </Button>
          ))}
        </div>

        {feedback && (
          <div
            className={`text-center p-3 rounded-md ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            <p className="font-medium">Guardian: "{feedback}"</p>
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Choose the correct symbol: {["<", "=", ">"].map((s) => getSymbolDisplay(s)).join(", ")}
          </p>
        </div>
      </Card>
    </div>
  )
}
