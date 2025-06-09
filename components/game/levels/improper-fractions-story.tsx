"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card } from "@/components/ui/card"

export function ImproperFractionsStory() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "The Overflowing Cheese Crate",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-gray-600">Narrator:</span> "Deeper into Squeaks' Emporium, a dusty corner
            reveals a stack of magical crates, each labeled with mysterious numbers and glowing softly."
          </p>
          <p className="text-lg">
            <span className="font-bold text-gray-600">Narrator:</span> "A sign above reads: 'Fractions That Don't Fit
            Neatly!'"
          </p>
          <p className="text-lg">
            <span className="font-bold text-blue-700">Whiskers:</span> "Whoa! That crate is supposed to hold one cheese
            wheel, right? But... there are more slices than one wheel!"
          </p>
          <div className="flex justify-center">
            <Image
              src="/impossible-cheese-wheel.png"
              alt="Overflowing cheese crate"
              width={300}
              height={200}
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      ),
    },
    {
      title: "What Are Improper Fractions?",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Good eye, traveler! What you're looking at is an
            improper fraction—it's when the number on top, the numerator, is bigger than the number on the bottom, the
            denominator."
          </p>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "See? If each cheese wheel has 4 slices, and I
            have 7 slices, I've got 7/4. That's more than a whole cheese!"
          </p>
          <div className="flex justify-center my-4">
            <div className="relative w-48 h-48">
              <Image
                src="/cheese-wheel-slices.png"
                alt="7 cheese slices from 4-slice wheels"
                width={192}
                height={192}
                className="object-contain"
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                7/4
              </div>
            </div>
          </div>
          <p className="text-lg">
            <span className="font-bold text-blue-700">Whiskers:</span> "So... what do I do with a fraction like that?"
          </p>
        </div>
      ),
    },
    {
      title: "Converting to Mixed Numbers",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Well, we turn it into a mixed number! That means
            we show how many whole cheese wheels you have, and what's left over."
          </p>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-bold text-lg text-amber-800 mb-2">Converting 7/4 to a Mixed Number:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Divide the top by the bottom: 7 ÷ 4 = 1 remainder 3</li>
              <li>The whole number is 1, the leftover is 3 slices out of 4</li>
              <li>So, 7/4 = 1 3/4!</li>
            </ol>
          </div>
          <div className="flex justify-center">
            <Image
              src="/cheese-slices-equation.png"
              alt="7/4 = 1 3/4 visual"
              width={300}
              height={150}
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Converting Mixed Numbers Back",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-blue-700">Whiskers:</span> "What if I have a mixed number like 2 2/5? How do
            I turn it back into an improper fraction?"
          </p>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Great question! Let's flip it around!"
          </p>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-bold text-lg text-amber-800 mb-2">Converting 2 2/5 to an Improper Fraction:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Multiply the whole number by the denominator: 2 × 5 = 10</li>
              <li>Add the numerator: 10 + 2 = 12</li>
              <li>Keep the same denominator: So, 2 2/5 = 12/5</li>
            </ol>
          </div>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Simple, right? You're just counting all the
            slices from full cheese wheels and the extra ones!"
          </p>
        </div>
      ),
    },
    {
      title: "Ready to Practice!",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-blue-700">Whiskers:</span> "That's not so hard when you break it down like
            that. Let's practice that conversion game now—I'm ready!"
          </p>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Let's see how fast your brain and paws can work
            together! To the Sorting Table!"
          </p>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-bold text-lg text-amber-800 mb-2">Key Points About Improper Fractions:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Improper fractions have numerators larger than denominators</li>
              <li>They represent more than one whole</li>
              <li>Can be converted to mixed numbers for easier understanding</li>
              <li>Mixed numbers can be converted back to improper fractions</li>
            </ul>
          </div>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Now you're ready for the next challenge!"
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
