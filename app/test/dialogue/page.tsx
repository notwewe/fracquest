"use client"

import { DialogueTest } from "@/components/game/dialogue-test"

export default function DialogueTestPage() {
  const testLines = [
    "Whew! That was a close one!",
    "The compass is ancient. It's been broken for centuries.",
    "He pulls out a map from his pocket.",
    "This is the way to the treasure!",
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dialogue Test</h1>
      <DialogueTest lines={testLines} />
    </div>
  )
}
