"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function ImproperFractions({ waypointId }: { waypointId: number }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "The Overflowing Cheese Crate",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-blue-700">Whiskers:</span> "Whoa! That crate is supposed to hold one cheese
            wheel, right? But... there are more slices than one wheel!"
          </p>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Good eye, traveler! What you're looking at is an
            improper fraction—it's when the number on top, the numerator, is bigger than the number on the bottom, the
            denominator."
          </p>
          <div className="flex justify-center">
            <div className="relative w-64 h-64 bg-amber-100 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-800">7/4</div>
                <p className="mt-2 text-amber-700">An improper fraction</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Learning About Improper Fractions",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "See? If each cheese wheel has 4 slices, and I
            have 7 slices, I've got 7/4. That's more than a whole cheese!"
          </p>
          <div className="flex justify-center my-4">
            <Image
              src="/impossible-cheese-wheel.png"
              alt="Cheese wheel with 7 slices"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-bold text-lg text-amber-800 mb-2">Improper Fraction:</h3>
            <p>
              A fraction where the numerator (top number) is greater than or equal to the denominator (bottom number).
            </p>
            <div className="flex justify-center mt-4">
              <div className="text-4xl font-bold text-amber-800">7/4</div>
            </div>
          </div>
          <p className="text-lg">
            <span className="font-bold text-blue-700">Whiskers:</span> "So... what do I do with a fraction like that?"
          </p>
        </div>
      ),
    },
    {
      title: "Converting Improper Fractions to Mixed Numbers",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Well, we turn it into a mixed number! That means
            we show how many whole cheese wheels you have, and what's left over."
          </p>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-bold text-lg text-amber-800 mb-2">Converting 7/4 to a mixed number:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Divide the top by the bottom: 7 ÷ 4 = 1 remainder 3</li>
              <li>That's 1 whole and 3 left over</li>
              <li>Write the mixed number: The whole is 1, the leftover is 3 slices out of 4</li>
              <li>So, 7/4 = 1 3/4</li>
            </ol>
          </div>
          <div className="flex justify-center my-4">
            <Image
              src="/cheese-wheel-slices.png"
              alt="Mixed number representation"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
          <p className="text-lg mt-4">
            <span className="font-bold text-amber-700">Squeaks:</span> "See? You had one full cheese wheel (4/4) and 3
            slices left. So it's 1 3/4!"
          </p>
        </div>
      ),
    },
    {
      title: "Converting Mixed Numbers to Improper Fractions",
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
            <h3 className="font-bold text-lg text-amber-800 mb-2">Converting 2 2/5 to an improper fraction:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Multiply the whole number by the denominator: 2 × 5 = 10</li>
              <li>Add the numerator: 10 + 2 = 12</li>
              <li>Keep the same denominator: So, 2 2/5 = 12/5</li>
            </ol>
          </div>
          <div className="flex justify-center my-4">
            <Image
              src="/cheese-slices-equation.png"
              alt="Converting mixed to improper"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
          <p className="text-lg mt-4">
            <span className="font-bold text-amber-700">Squeaks:</span> "Simple, right? You're just counting all the
            slices from full cheese wheels and the extra ones!"
          </p>
        </div>
      ),
    },
    {
      title: "Ready for the Challenge",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-blue-700">Whiskers:</span> "That's not so hard when you break it down like
            that. Let's play that conversion game now—I'm ready!"
          </p>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Let's see how fast your brain and paws can work
            together! To the Sorting Table!"
          </p>
          <div className="flex justify-center mt-6">
            <div className="bg-amber-100 p-6 rounded-lg border-2 border-amber-300 shadow-lg">
              <h3 className="font-bold text-xl text-amber-800 mb-4 text-center">Conversion Game Challenge</h3>
              <p className="text-center text-lg">Convert between improper fractions and mixed numbers!</p>
              <div className="flex justify-center mt-4">
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-lg px-6 py-3"
                  onClick={() => router.push("/student/game/play/4")}
                >
                  Start Game
                </Button>
              </div>
            </div>
          </div>
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
