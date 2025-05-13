"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type DialogueTestProps = {
  lines: string[]
}

export function DialogueTest({ lines }: DialogueTestProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [displayedText, setDisplayedText] = useState(lines[0])

  const handleNext = () => {
    if (currentLine < lines.length - 1) {
      const nextLine = currentLine + 1
      setCurrentLine(nextLine)
      setDisplayedText(lines[nextLine])
    }
  }

  return (
    <div className="p-4 bg-black text-white">
      <div className="border-2 border-amber-600 p-4 mb-4">
        <p className="font-pixel text-lg">{displayedText}</p>
      </div>
      <Button onClick={handleNext} className="bg-amber-600 hover:bg-amber-700">
        Next
      </Button>
    </div>
  )
}
