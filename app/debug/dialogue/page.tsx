"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const testDialogues = [
  {
    speaker: "Whiskers",
    text: "Whew! That Sorting Table was no joke... but I've got these conversions down now!",
  },
  {
    speaker: "Squeaks",
    text: "The compass is ancient. Scattered. Broken into pieces that are—quite fittingly—fractions of a whole.",
  },
  {
    speaker: "Narrator",
    text: "He pulls a glowing gear-shaped fragment from under the counter and inserts it into the door.",
  },
]

export default function DebugDialoguePage() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    if (currentIndex < testDialogues.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  const currentDialogue = testDialogues[currentIndex]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-8">Dialogue Debug</h1>

      <div className="bg-black border-4 border-amber-600 p-6 mb-6 max-w-2xl">
        <div className="text-amber-400 font-bold mb-2">{currentDialogue.speaker}</div>
        <div className="text-white text-lg whitespace-pre-wrap">{currentDialogue.text}</div>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleNext} className="bg-amber-600 hover:bg-amber-700">
          Next Dialogue
        </Button>
      </div>

      <div className="mt-8 bg-gray-800 p-4 rounded">
        <h2 className="text-xl font-bold mb-4">Raw Text:</h2>
        <pre className="bg-gray-900 p-4 overflow-x-auto">{JSON.stringify(currentDialogue, null, 2)}</pre>
      </div>
    </div>
  )
}
