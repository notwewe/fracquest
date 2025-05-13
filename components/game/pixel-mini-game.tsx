"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { PixelAsset } from "./pixel-assets"
import { cn } from "@/lib/utils"

type PixelMiniGameProps = {
  title: string
  background: string
  onComplete: (score: number) => void
  gameType: "conversion" | "addition" | "subtraction"
  questions: {
    question: string
    options: string[]
    correctIndex: number
    visualAid?: string
  }[]
}

export function PixelMiniGame({ title, background, onComplete, gameType, questions }: PixelMiniGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(3)
  const [gameStarted, setGameStarted] = useState(false)
  const [showEffect, setShowEffect] = useState<"correct" | "wrong" | null>(null)

  // Game start countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setGameStarted(true)
    }
  }, [countdown])

  const handleAnswer = (index: number) => {
    setSelectedOption(index)
    setAnswered(true)

    if (index === questions[currentQuestion].correctIndex) {
      setScore(score + 1)
      setShowEffect("correct")

      // Play success sound effect (would be implemented with a sound library)
    } else {
      setShowEffect("wrong")

      // Play error sound effect (would be implemented with a sound library)
    }

    // After a short delay, move to the next question
    setTimeout(() => {
      setShowEffect(null)

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setAnswered(false)
        setSelectedOption(null)
      } else {
        onComplete(score + (index === questions[currentQuestion].correctIndex ? 1 : 0))
      }
    }, 1500)
  }

  const getGameIcon = () => {
    switch (gameType) {
      case "conversion":
        return "/pixel-items/fraction-potion.png"
      case "addition":
        return "/pixel-items/fraction-compass.png"
      case "subtraction":
        return "/pixel-items/lessmore-bridge.png"
      default:
        return "/pixel-items/fraction-orb-whole.png"
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (!gameStarted) {
    return (
      <div className="relative w-full h-[480px] overflow-hidden bg-gray-900 border-4 border-amber-700 flex flex-col items-center justify-center">
        <h2 className="font-pixel text-2xl text-amber-400 mb-6">{title}</h2>
        <PixelAsset
          src={getGameIcon()}
          alt={`${gameType} game icon`}
          width={64}
          height={64}
          className="mb-6 pixelated animate-pixel-bounce"
        />
        <div className="font-pixel text-4xl text-white mb-8">{countdown || "GO!"}</div>
        <p className="font-pixel text-sm text-gray-300 max-w-md text-center">
          Answer the questions correctly to earn points!
        </p>
      </div>
    )
  }

  return (
    <div className="pixel-mini-game">
      <div className="relative w-full h-[480px] overflow-hidden border-4 border-amber-700 rounded-none">
        <PixelAsset
          src={background}
          alt="Game background"
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full pixelated"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="bg-black bg-opacity-90 p-6 rounded-none max-w-lg w-full border-4 border-amber-600">
            <div className="flex items-center mb-4">
              <Image
                src={getGameIcon() || "/placeholder.svg"}
                alt={`${gameType} game icon`}
                width={32}
                height={32}
                className="pixelated mr-3"
              />
              <h2 className="text-xl text-amber-400 font-pixel">{title}</h2>

              {/* Score display */}
              <div className="ml-auto flex items-center">
                <div className="pixel-score">
                  Score: {score}/{questions.length}
                </div>
              </div>
            </div>

            <div className="pixel-progress mb-6">
              <div className="pixel-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="mb-6">
              <p className="text-white text-lg mb-4 font-pixel">{questions[currentQuestion].question}</p>

              {questions[currentQuestion].visualAid && (
                <div className="mb-4 flex justify-center">
                  <PixelAsset
                    src={questions[currentQuestion].visualAid}
                    alt="Visual aid"
                    width={160}
                    height={120}
                    className="pixelated animate-pixel-bounce"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !answered && handleAnswer(index)}
                  className={cn(
                    "p-4 rounded-none text-white text-center transition-all font-pixel border-2",
                    answered
                      ? index === questions[currentQuestion].correctIndex
                        ? "bg-green-600 border-green-400"
                        : index === selectedOption
                          ? "bg-red-600 border-red-400"
                          : "bg-gray-700 opacity-50 border-gray-600"
                      : "bg-amber-700 hover:bg-amber-600 active:transform active:scale-95 border-amber-500",
                  )}
                  disabled={answered}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual feedback effects */}
        {showEffect === "correct" && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-20 animate-pixel-fade-in">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-pixel text-4xl text-green-400 animate-pixel-bounce">
              CORRECT!
            </div>
          </div>
        )}

        {showEffect === "wrong" && (
          <div className="absolute inset-0 bg-red-500 bg-opacity-20 animate-pixel-fade-in">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-pixel text-4xl text-red-400 animate-pixel-shake">
              TRY AGAIN!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
