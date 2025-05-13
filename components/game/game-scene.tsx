"use client"

import { useState } from "react"
import { DialogueBox } from "./dialogue-box"

type SceneCharacter = {
  type: string
  name: string
  position: "left" | "center" | "right"
}

type DialogueLine = {
  character: string
  text: string
}

type GameSceneProps = {
  location: string
  characters: SceneCharacter[]
  dialogue: DialogueLine[]
  onComplete?: () => void
}

export function GameScene({ location, characters, dialogue, onComplete }: GameSceneProps) {
  const [currentDialogue, setCurrentDialogue] = useState(0)

  const handleDialogueComplete = () => {
    if (currentDialogue < dialogue.length - 1) {
      setCurrentDialogue((prev) => prev + 1)
    } else {
      onComplete && onComplete()
    }
  }

  const currentLine = dialogue[currentDialogue]
  const speakingCharacter = characters.find((c) => c.name === currentLine.character)

  return (
    <div className="game-scene relative w-full h-[500px] overflow-hidden">
      {/* Background - text only, no images */}
      <div className="absolute inset-0 flex items-center justify-center bg-amber-900 bg-opacity-20">
        <div className="text-4xl font-pixel text-amber-200">{location}</div>
      </div>

      {/* Characters - text only, no images */}
      <div className="absolute inset-0 flex items-end justify-between pb-32">
        {characters.map((character, index) => {
          const positions = {
            left: "ml-8",
            center: "mx-auto",
            right: "mr-8",
          }

          return (
            <div key={index} className={`${positions[character.position]}`}>
              <div
                className={`font-pixel text-amber-300 text-center ${character.name === currentLine.character ? "animate-bounce-slow" : ""}`}
              >
                {character.name}
              </div>
            </div>
          )
        })}
      </div>

      {/* Dialogue */}
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <DialogueBox
          text={currentLine.text}
          characterName={currentLine.character}
          onComplete={handleDialogueComplete}
        />
      </div>
    </div>
  )
}
