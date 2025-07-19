"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card } from "@/components/ui/card"

export function FractionIntroduction() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      speaker: "Squeaks",
      title: "Welcome to Squeaks' Fraction Emporium",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Well, hello there, traveler! Welcome to Squeaks' Fraction Emporium, home to the finest fraction gadgets in all of Numeria!"
          </p>
          <p className="text-lg">
            <span className="font-bold text-blue-700">Whiskers:</span> "I heard this is where math meets magic. I'm trying to learn more about fractions—heard they're the key to saving the kingdom!"
          </p>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Then you've come to the right place! Fractions are all about parts of a whole. Let me show you!"
          </p>
          <div className="flex justify-center">
            <Image
              src="/game backgrounds/Squeaks Emporium.png"
              alt="Fraction Emporium"
              width={300}
              height={200}
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      ),
    },
    {
      speaker: "Squeaks",
      title: "Learning About Fractions",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "If I eat one slice of this cheese wheel that's cut into 4 equal parts, I've eaten 1 out of 4... or 1/4."
          </p>
          <div className="flex justify-center my-4">
            <div className="relative w-48 h-48">
              <Image
                src="/pixel-items/cheese-wheel-quarters.png"
                alt="Cheese wheel cut into quarters"
                width={192}
                height={192}
                className="object-contain bg-cover bg-center"
                style={{ backgroundImage: "url('/game backgrounds/Squeaks Emporium.png')" }}
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                1/4
              </div>
            </div>
          </div>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "The top number tells us how many slices we have, and the bottom number tells us how many equal slices the whole cheese had!"
          </p>
        </div>
      ),
    },
    {
      speaker: "Squeaks",
      title: "More Examples",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Let me show you more examples:"
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="bg-amber-100 p-4 rounded-lg shadow-md">
                <p className="font-bold mb-2">A pie sliced into 8 pieces:</p>
                <p className="text-xl">"3 slices is 3/8!"</p>
                <div className="flex justify-center mt-2">
                  <div className="relative w-24 h-24 bg-amber-200 rounded-full flex items-center justify-center">
                    <div className="text-2xl font-bold">3/8</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 p-4 rounded-lg shadow-md">
                <p className="font-bold mb-2">A potion bottle half full:</p>
                <p className="text-xl">"That's 1/2!"</p>
                <div className="flex justify-center mt-2">
                  <div className="relative w-24 h-24 bg-amber-200 rounded-full flex items-center justify-center">
                    <div className="text-2xl font-bold">1/2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      speaker: "Squeaks",
      title: "Understanding Fractions",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-blue-700">Whiskers:</span> "So fractions are just parts of something bigger?"
          </p>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Exactly! Once you understand how they work, you can compare them, add them, and even use them in magic!"
          </p>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-bold text-lg text-amber-800 mb-2">Key Points About Fractions:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>A fraction represents a part of a whole</li>
              <li>The top number (numerator) tells us how many parts we have</li>
              <li>The bottom number (denominator) tells us how many equal parts make up the whole</li>
              <li>Fractions can be compared, added, subtracted, and more!</li>
            </ul>
          </div>
          <p className="text-lg">
            <span className="font-bold text-amber-700">Squeaks:</span> "Now that you get the basics, it's time for something bigger..."
          </p>
        </div>
      ),
    },
  ];

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

  // Helper to check if Squeaks is speaking in the current step
  const isSqueaksSpeaking = () => steps[currentStep].speaker === "Squeaks";

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-4 relative"
      style={{
        backgroundImage: "url('/game backgrounds/Squeaks Emporium.png')",
      }}
    >
      {/* Squeaks character image - show when Squeaks is speaking */}
      {steps[currentStep].speaker === "Squeaks" && (
        <div className="absolute left-24 bottom-[290px] z-10">
          <Image
            src="/game-characters/Squeaks.png"
            alt="Squeaks"
            width={200}
            height={200}
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      )}
      <Card className="w-full max-w-2xl mx-auto p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl my-8 relative z-20">
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
