"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LevelCompletionPopup } from "../level-completion-popup"

type Question = {
  type: "conversion" | "addition" | "subtraction" | "arrange" | "compare"
  question: string
  options?: string[]
  answer: string
  hint?: string
}

export function FinalBossGame() {
  const [phase, setPhase] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(20)
  const [userAnswer, setUserAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [gameComplete, setGameComplete] = useState(false)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [phaseComplete, setPhaseComplete] = useState(false)

  // Questions for each phase
  const phaseQuestions: Record<number, Question[]> = {
    1: [
      // Conversion Clash
      {
        type: "conversion",
        question: "Convert 9/4 to a mixed number",
        answer: "2 1/4",
        hint: "Divide 9 by 4 to get 2 with remainder 1",
      },
      {
        type: "conversion",
        question: "Convert 2 3/5 to an improper fraction",
        answer: "13/5",
        hint: "Multiply 2 by 5 and add 3",
      },
      {
        type: "conversion",
        question: "Convert 13/5 to a mixed number",
        answer: "2 3/5",
        hint: "Divide 13 by 5 to get 2 with remainder 3",
      },
    ],
    2: [
      // Addition Ambush
      {
        type: "addition",
        question: "Which pair of fractions adds up to 5/6?",
        options: ["1/2 + 1/3", "2/3 + 1/6", "1/4 + 1/2"],
        answer: "2/3 + 1/6",
        hint: "Convert to the same denominator and add",
      },
      {
        type: "addition",
        question: "Which pair of fractions adds up to 1?",
        options: ["1/4 + 3/4", "2/5 + 2/5", "1/3 + 1/2"],
        answer: "1/4 + 3/4",
        hint: "Which fractions form a whole?",
      },
    ],
    3: [
      // Subtraction Spiral
      { type: "subtraction", question: "Calculate 7/8 - 3/8", answer: "1/2", hint: "Subtract and simplify if needed" },
      {
        type: "subtraction",
        question: "Calculate 5/6 - 1/2",
        answer: "1/3",
        hint: "Convert to the same denominator first",
      },
    ],
    4: [
      // Fraction Forest Echo
      {
        type: "arrange",
        question: "Arrange from least to greatest: 3/4, 2/3, 5/6, 1/2",
        answer: "1/2, 2/3, 3/4, 5/6",
        hint: "Convert to the same denominator to compare",
      },
    ],
    5: [
      // Realm of Balance: Comparison Combat
      {
        type: "compare",
        question: "Compare 4/5 and 3/4 (use >, <, or =)",
        answer: ">",
        hint: "Convert to the same denominator",
      },
      { type: "compare", question: "Compare 2/3 and 6/9 (use >, <, or =)", answer: "=", hint: "Simplify 6/9 first" },
      {
        type: "compare",
        question: "Compare 1/2 and 3/8 (use >, <, or =)",
        answer: ">",
        hint: "Convert to the same denominator",
      },
    ],
  }

  const phantomFeedback = {
    correct: [
      "You see through my tricks...",
      "Your knowledge grows stronger...",
      "Impressive, but the challenge continues!",
      "You've mastered this skill, but there are more tests ahead.",
      "Your fraction powers are formidable!",
    ],
    incorrect: [
      "You stumble already? Your memory fails you...",
      "Your answers crumble... just like your confidence.",
      "Lost in the woods again, kitty?",
      "Off-balance. As expected.",
      "Your understanding is... incomplete.",
    ],
  }

  const phaseNames = [
    "Conversion Clash",
    "Addition Ambush",
    "Subtraction Spiral",
    "Fraction Forest Echo",
    "Comparison Combat",
  ]

  useEffect(() => {
    if (currentQuestion >= phaseQuestions[phase].length) {
      setPhaseComplete(true)
    }
  }, [currentQuestion, phase])

  useEffect(() => {
    if (phase > 5) {
      setGameComplete(true)
      setShowCompletionPopup(true)
    }
  }, [phase])

  const handleAnswer = () => {
    const currentPhaseQuestions = phaseQuestions[phase]
    const question = currentPhaseQuestions[currentQuestion]

    let correct = false
    if (question.type === "addition" || question.type === "arrange") {
      // For multiple choice or ordering questions
      correct = userAnswer.trim().toLowerCase() === question.answer.toLowerCase()
    } else {
      // For direct input questions
      correct = userAnswer.trim().toLowerCase() === question.answer.toLowerCase()
    }

    setIsCorrect(correct)

    if (correct) {
      setFeedback(phantomFeedback.correct[Math.floor(Math.random() * phantomFeedback.correct.length)])
    } else {
      setFeedback(phantomFeedback.incorrect[Math.floor(Math.random() * phantomFeedback.incorrect.length)])
      setScore(Math.max(0, score - 2)) // Deduct 2 points for wrong answer
    }

    setTimeout(() => {
      setUserAnswer("")
      setIsCorrect(null)
      setFeedback("")
      if (correct) {
        if (currentQuestion + 1 < currentPhaseQuestions.length) {
          setCurrentQuestion(currentQuestion + 1)
        } else {
          setPhaseComplete(true)
        }
      }
    }, 1500)
  }

  const handleNextPhase = () => {
    setPhase(phase + 1)
    setCurrentQuestion(0)
    setPhaseComplete(false)
  }

  const renderQuestion = () => {
    if (phaseComplete) {
      return (
        <div className="text-center p-6">
          <h3 className="text-xl font-bold mb-4">Phase {phase} Complete!</h3>
          <p className="mb-4">You've mastered the {phaseNames[phase - 1]}!</p>
          <Button onClick={handleNextPhase} className="bg-purple-600 hover:bg-purple-700">
            Continue to {phase < 5 ? phaseNames[phase] : "Final Challenge"}
          </Button>
        </div>
      )
    }

    const question = phaseQuestions[phase][currentQuestion]

    return (
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4">{phaseNames[phase - 1]}</h3>
        <p className="text-lg mb-6">{question.question}</p>

        {question.options ? (
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => setUserAnswer(option)}
                className={`w-full justify-start text-left ${userAnswer === option ? "bg-blue-600" : "bg-blue-500"}`}
              >
                {option}
              </Button>
            ))}
          </div>
        ) : (
          <Input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter your answer"
            className="mb-6"
          />
        )}

        {question.hint && <p className="text-sm text-gray-600 mb-4">Hint: {question.hint}</p>}

        <Button
          onClick={handleAnswer}
          disabled={!userAnswer.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Submit Answer
        </Button>

        {feedback && (
          <div
            className={`mt-4 p-3 rounded-md ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            <p className="font-medium">Decimal Phantom: "{feedback}"</p>
          </div>
        )}
      </div>
    )
  }

  if (gameComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        {showCompletionPopup && (
          <LevelCompletionPopup
            levelName="Dreadpoint Hollow"
            score={score}
            onClose={() => setShowCompletionPopup(false)}
          />
        )}
        <div className="text-center mt-8">
          <h2 className="text-2xl font-bold mb-4">Victory!</h2>
          <p className="text-lg mb-6">
            "How... how could you balance what I made to break?" the Decimal Phantom fades away as light floods
            Dreadpoint Hollow.
          </p>
          <p className="italic text-gray-600 mb-4">
            "Fractions aren't just numbers... they're pieces of the whole. And so am I."
          </p>
          <p className="text-lg">The fog lifts. Balance returns to Numeria.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Dreadpoint Hollow</h2>
        <p className="text-lg mt-2">
          Phase {phase} of 5: {phaseNames[phase - 1]}
        </p>
        {!phaseComplete && (
          <p className="text-sm mt-1">
            Question {currentQuestion + 1} of {phaseQuestions[phase].length}
          </p>
        )}
        <p className="text-sm font-semibold">Score: {score}/20</p>
      </div>

      <Card className="w-full max-w-2xl bg-gradient-to-b from-gray-800 to-purple-900 text-white shadow-lg border-purple-700">
        {renderQuestion()}
      </Card>
    </div>
  )
}
