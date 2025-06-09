"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card } from "@/components/ui/card"

export function AdditionIntroductionStory() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Assembling the Fraction Compass",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-gray-600">Narrator:</span> "The back room of the Emporium. A floating
            pedestal glows, waiting for the compass pieces to be placed."
          </p>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "If you can fix the compass, then you shall
            continue on your journey to restore the Fraction Orb!"
          </p>
          <div className="flex justify-center">
            <Image
              src="/magical-glowing-compass.png"
              alt="Magical compass pieces floating"
              width={300}
              height={200}
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Adding Fractions with Same Denominators",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "When you add fractions with the same bottom
            number—the denominator—you just add the top numbers!"
          </p>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-bold text-lg text-amber-800 mb-2">Examples:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>1/4 + 2/4 = 3/4</li>
              <li>2/8 + 5/8 = 7/8</li>
              <li>1/6 + 3/6 = 4/6 = 2/3</li>
            </ul>
          </div>
          <div className="flex justify-center my-4">
            <div className="relative w-48 h-48">
              <Image
                src="/fraction-diagram.png"
                alt="Fraction addition visual"
                width={192}
                height={192}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Adding Fractions with Different Denominators",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "When the denominators are different, we need to
            do a little more work."
          </p>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-bold text-lg text-amber-800 mb-2">Steps for Different Denominators:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Find the Least Common Denominator (LCD)</li>
              <li>Convert each fraction to have the LCD</li>
              <li>Add the numerators</li>
              <li>Simplify if needed</li>
            </ol>
          </div>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "For example: 1/2 + 1/4 = 2/4 + 1/4 = 3/4"
          </p>
        </div>
      ),
    },
    {
      title: "More Examples",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Let me show you another example:"
          </p>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-bold text-lg text-amber-800 mb-2">Example: 2/3 + 1/6</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Find LCD of 3 and 6: LCD = 6</li>
              <li>Convert 2/3 to 4/6</li>
              <li>Add: 4/6 + 1/6 = 5/6</li>
            </ol>
          </div>
          <p className="text-lg">
            <span className="font-bold text-blue-700">Whiskers:</span> "So to assemble the compass, I just need to know
            how much I've added so far?"
          </p>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Precisely! But be careful—only the exact total
            will activate it!"
          </p>
        </div>
      ),
    },
    {
      title: "Ready for the Compass Challenge!",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Now you're ready to restore the Fraction
            Compass! Each correct addition will add a piece to the compass."
          </p>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-bold text-lg text-amber-800 mb-2">Remember:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Same denominators: Just add the numerators</li>
              <li>Different denominators: Find LCD first</li>
              <li>Always simplify your answer if possible</li>
              <li>Check your work by thinking about the size</li>
            </ul>
          </div>
          <div className="flex justify-center">
            <Image
              src="/magical-glowing-compass.png"
              alt="Compass ready to be assembled"
              width={300}
              height={200}
              className="rounded-lg shadow-md"
            />
          </div>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Let's begin the compass assembly challenge!"
          </p>
        </div>
      ),
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-4">
      <Card className="w-full max-w-3xl p-6 bg-gradient-to-b from-amber-50 to-amber-100 shadow-lg">
        <h2 className="text-2xl font-bold text-amber-800 mb-4">{steps[currentStep].title}</h2>
        <div className="min-h-[350px]">{steps[currentStep].content}</div>
        <div className="flex justify-between mt-6">
          <Button onClick={handlePrevious} disabled={currentStep === 0} className="bg-amber-600 hover:bg-amber-700">
            Previous
          </Button>
          <div className="text-sm text-amber-700">
            Step {currentStep + 1} of {steps.length}
          </div>
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  )
}
