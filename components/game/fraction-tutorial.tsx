"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface TutorialStep {
  title: string
  content: string
  image?: string
  example?: string
  steps?: string[]
}

interface FractionTutorialProps {
  title: string
  description: string
  steps: TutorialStep[]
  onComplete: () => void
}

export function FractionTutorial({ title, description, steps, onComplete }: FractionTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const step = steps[currentStep]

  return (
    <Card className="border-2 border-amber-800 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-2xl font-pixel text-amber-900">{title}</CardTitle>
        <p className="font-pixel text-amber-700">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="text-xl font-pixel text-amber-800">{step.title}</h3>

          {step.image && (
            <div className="flex justify-center mb-4">
              <Image
                src={step.image || "/placeholder.svg"}
                alt={step.title}
                width={400}
                height={300}
                className="rounded-lg border-2 border-amber-400"
              />
            </div>
          )}

          <div className="font-pixel text-amber-700 whitespace-pre-line">{step.content}</div>

          {step.example && (
            <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-300">
              <h4 className="font-pixel text-amber-900 mb-2">Example:</h4>
              <div className="font-pixel text-amber-800 whitespace-pre-line">{step.example}</div>
            </div>
          )}

          {step.steps && (
            <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-300">
              <h4 className="font-pixel text-amber-900 mb-2">Steps:</h4>
              <ol className="list-decimal pl-5 space-y-2">
                {step.steps.map((stepItem, index) => (
                  <li key={index} className="font-pixel text-amber-800">
                    {stepItem}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          variant="outline"
          className="font-pixel border-amber-600 text-amber-700"
        >
          Previous
        </Button>
        <div className="font-pixel text-amber-700">
          Step {currentStep + 1} of {steps.length}
        </div>
        <Button onClick={handleNext} className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
          {currentStep === steps.length - 1 ? "Complete" : "Next"}
        </Button>
      </CardFooter>
    </Card>
  )
}
