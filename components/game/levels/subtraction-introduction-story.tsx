"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card } from "@/components/ui/card"

export function SubtractionIntroductionStory() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Arrival at Lessmore Bridge",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-gray-600">Narrator:</span> "Whiskers arrives at the edge of a misty ravine.
            A grand, glowing bridge once stood here—but now, parts of it are missing."
          </p>
          <p className="text-lg">
            <span className="font-bold text-blue-700">Whiskers:</span> "The compass brought me here... but the bridge is
            broken!"
          </p>
          <div className="flex justify-center">
            <Image
              src="/fantasy-bridge.png"
              alt="Broken Lessmore Bridge"
              width={300}
              height={200}
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Meeting Elder Pebble",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-gray-600">Narrator:</span> "A gentle rumble echoes as an ancient figure
            rises from the stone—Elder Pebble, the guardian of understanding."
          </p>
          <p className="text-lg">
            <span className="font-bold text-purple-700">Elder Pebble:</span> "Only those who understand taking away can
            rebuild what was lost. You must master the art of fraction subtraction to restore the bridge."
          </p>
          <div className="flex justify-center my-4">
            <div className="relative w-48 h-48">
              <Image
                src="/pixel-characters/elder-pebble.png"
                alt="Elder Pebble"
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
      title: "Subtracting Fractions with Same Denominators",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-purple-700">Elder Pebble:</span> "Start with 5 out of 8. Take away 2 of the
            same kind. What remains?"
          </p>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-bold text-lg text-purple-800 mb-2">Examples:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>5/8 − 2/8 = 3/8</li>
              <li>3/4 − 1/4 = 2/4 → 1/2</li>
              <li>6/6 − 4/6 = 2/6 → 1/3</li>
            </ul>
          </div>
          <p className="text-lg">
            <span className="font-bold text-blue-700">Whiskers:</span> "So when the parts match, it's like taking blocks
            from the same pile?"
          </p>
          <p className="text-lg">
            <span className="font-bold text-purple-700">Elder Pebble:</span> "Exactly. When the pieces share a name, you
            simply subtract the tops."
          </p>
        </div>
      ),
    },
    {
      title: "Subtracting Fractions with Different Denominators",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-purple-700">Elder Pebble:</span> "But not all fractions speak the same
            tongue... When parts differ, you must make them agree."
          </p>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-bold text-lg text-purple-800 mb-2">Example: 3/4 - 2/5</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Find LCD of 4 and 5: LCD = 20</li>
              <li>Convert: 3/4 → 15/20, 2/5 → 8/20</li>
              <li>Subtract: 15/20 − 8/20 = 7/20</li>
            </ol>
          </div>
          <p className="text-lg">
            <span className="font-bold text-purple-700">Elder Pebble:</span> "By reshaping the parts, you've brought
            them to unity. Only then can subtraction begin."
          </p>
        </div>
      ),
    },
    {
      title: "Ready to Rebuild the Bridge!",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-purple-700">Elder Pebble:</span> "Now, solve subtraction problems to prove
            your worth and cross the bridge!"
          </p>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-bold text-lg text-purple-800 mb-2">Remember:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Same denominators: Just subtract the numerators</li>
              <li>Different denominators: Find LCD first</li>
              <li>Always simplify your answer if possible</li>
              <li>Check that your answer makes sense</li>
            </ul>
          </div>
          <div className="flex justify-center">
            <Image
              src="/fantasy-bridge.png"
              alt="Bridge ready to be rebuilt"
              width={300}
              height={200}
              className="rounded-lg shadow-md"
            />
          </div>
          <p className="text-lg">
            <span className="font-bold text-purple-700">Elder Pebble:</span> "Each correct answer will restore a stone
            to the bridge!"
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
      <Card className="w-full max-w-3xl p-6 bg-gradient-to-b from-purple-50 to-purple-100 shadow-lg">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">{steps[currentStep].title}</h2>
        <div className="min-h-[350px]">{steps[currentStep].content}</div>
        <div className="flex justify-between mt-6">
          <Button onClick={handlePrevious} disabled={currentStep === 0} className="bg-purple-600 hover:bg-purple-700">
            Previous
          </Button>
          <div className="text-sm text-purple-700">
            Step {currentStep + 1} of {steps.length}
          </div>
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  )
}
