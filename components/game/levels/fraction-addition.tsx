"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export function FractionAddition({ waypointId }: { waypointId: number }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Assembling the Fraction Compass",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "If you can fix the compass, then you shall
            unlock the path to the next chapter of your quest!"
          </p>
          <div className="flex justify-center my-4">
            <Image
              src="/placeholder.svg?height=200&width=200&query=magical compass with missing pieces"
              alt="Fraction Compass"
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "To assemble the compass, we need to understand
            how to add fractions together."
          </p>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">1/4 + 2/4 = 3/4</div>
                <div className="flex justify-center mt-2 space-x-2">
                  <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                    <div className="text-lg">1/4</div>
                  </div>
                  <div className="text-xl flex items-center">+</div>
                  <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                    <div className="text-lg">2/4</div>
                  </div>
                  <div className="text-xl flex items-center">=</div>
                  <div className="w-12 h-12 bg-amber-300 rounded-full flex items-center justify-center">
                    <div className="text-lg">3/4</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">2/8 + 5/8 = 7/8</div>
                <div className="flex justify-center mt-2 space-x-2">
                  <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                    <div className="text-lg">2/8</div>
                  </div>
                  <div className="text-xl flex items-center">+</div>
                  <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                    <div className="text-lg">5/8</div>
                  </div>
                  <div className="text-xl flex items-center">=</div>
                  <div className="w-12 h-12 bg-amber-300 rounded-full flex items-center justify-center">
                    <div className="text-lg">7/8</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center my-4">
            <Image
              src="/placeholder.svg?height=200&width=200&query=adding fractions with same denominator visual"
              alt="Adding fractions with same denominator"
              width={200}
              height={200}
              className="rounded-lg"
            />
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
            <h3 className="font-bold text-lg text-amber-800 mb-2">How to Find a Common Denominator:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Look at both denominators</li>
              <li>Find the Least Common Denominator (LCD) – the smallest number both can divide into</li>
              <li>Rewrite each fraction so they have this shared denominator</li>
              <li>Then, add the numerators like usual!</li>
            </ol>
          </div>
          <div className="flex justify-center my-4">
            <Image
              src="/placeholder.svg?height=200&width=200&query=finding common denominator for fractions"
              alt="Finding common denominator"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Example 1: Adding Fractions with Different Denominators",
      content: (
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-bold text-lg text-amber-800 mb-2">Example 1: 1/2 + 1/4 = ?</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Denominators: 2 and 4</li>
              <li>LCD = 4 (because 4 is divisible by both 2 and 4)</li>
              <li>Convert 1/2 to 2/4 (multiply top and bottom by 2)</li>
              <li>Now add: 2/4 + 1/4 = 3/4</li>
            </ol>
            <div className="flex justify-center mt-4">
              <div className="text-2xl font-bold">1/2 + 1/4 = 2/4 + 1/4 = 3/4</div>
            </div>
          </div>
          <div className="flex justify-center my-4">
            <Image
              src="/placeholder.svg?height=200&width=200&query=adding 1/2 and 1/4 with visual steps"
              alt="Adding 1/2 and 1/4"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "See how we converted 1/2 to 2/4 so both
            fractions have the same denominator? Then we just add the numerators!"
          </p>
        </div>
      ),
    },
    {
      title: "Example 2: Adding Fractions with Different Denominators",
      content: (
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-bold text-lg text-amber-800 mb-2">Example 2: 2/3 + 1/6 = ?</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Denominators: 3 and 6</li>
              <li>LCD = 6 (because 6 is divisible by both 3 and 6)</li>
              <li>Convert 2/3 to 4/6 (multiply top and bottom by 2)</li>
              <li>Now add: 4/6 + 1/6 = 5/6</li>
            </ol>
            <div className="flex justify-center mt-4">
              <div className="text-2xl font-bold">2/3 + 1/6 = 4/6 + 1/6 = 5/6</div>
            </div>
          </div>
          <div className="flex justify-center my-4">
            <Image
              src="/placeholder.svg?height=200&width=200&query=adding 2/3 and 1/6 with visual steps"
              alt="Adding 2/3 and 1/6"
              width={200}
              height={200}
              className="rounded-lg"
            />
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
      title: "Practice Problems",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Let's try a few practice problems before you
            tackle the compass game!"
          </p>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-bold text-lg text-amber-800 mb-2">Try It Yourself!</h3>
            <p className="italic text-sm mb-2">(Hint: Find a common denominator first if needed!)</p>
            <ol className="list-decimal pl-5 space-y-4">
              <li>
                <div>What is 1/3 + 1/6 = ?</div>
                <div className="text-sm text-gray-600 mt-1">Convert to the same denominator: 2/6 + 1/6 = 3/6 = 1/2</div>
              </li>
              <li>
                <div>What is 3/8 + 2/8 = ?</div>
                <div className="text-sm text-gray-600 mt-1">Same denominator: 3/8 + 2/8 = 5/8</div>
              </li>
              <li>
                <div>What is 1/2 + 2/5 = ?</div>
                <div className="text-sm text-gray-600 mt-1">LCD = 10: 5/10 + 4/10 = 9/10</div>
              </li>
            </ol>
          </div>
          <p className="text-lg mt-4">
            <span className="font-bold text-amber-700">Squeaks:</span> "Now you're ready for the Compass Completion
            Quest!"
          </p>
          <div className="flex justify-center mt-6">
            <div className="bg-amber-100 p-6 rounded-lg border-2 border-amber-300 shadow-lg">
              <h3 className="font-bold text-xl text-amber-800 mb-4 text-center">Compass Completion Quest</h3>
              <p className="text-center text-lg">Add fractions to complete the magical compass!</p>
              <div className="flex justify-center mt-4">
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-lg px-6 py-3"
                  onClick={() => router.push("/student/game/play/6")}
                >
                  Start Quest
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
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0 bg-[url('/game backgrounds/Backrooms.png')] bg-cover bg-center" />
      {/* Overlay for readability */}
      <div className="absolute inset-0 z-10 bg-amber-900 bg-opacity-20" />
      {/* Foreground content */}
      <div className="relative z-20 min-h-screen w-full flex flex-col">
        {/* ...existing interactive content... */}
        {/* Place the rest of your FractionAddition JSX here, starting with the Card and stepper UI */}
        {/* Example: */}
        <Card className="w-full max-w-2xl mx-auto p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl my-8">
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
    </div>
  )
}
